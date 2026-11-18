// Teste de ponta a ponta da API contra um servidor já rodando.
// Uso: BASE=http://localhost:3000 ADMIN_EMAIL=... ADMIN_PASSWORD=... node scripts/api-test.mjs
// Cria dados de teste (cliente "teste-<timestamp>@exemplo.com") e os remove no fim.
import assert from "node:assert/strict";
import { deflateSync } from "node:zlib";

const BASE = process.env.BASE ?? "http://localhost:3000";
const ADMIN = { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD };
let passed = 0;
const results = [];

class Client {
  cookie = "";
  async req(method, path, body, extra = {}) {
    const headers = { origin: new URL(BASE).origin, ...(this.cookie && { cookie: this.cookie }), ...extra.headers };
    let payload = body;
    if (body && !(body instanceof FormData)) { headers["content-type"] = "application/json"; payload = JSON.stringify(body); }
    const res = await fetch(BASE + path, { method, headers, body: payload, redirect: "manual" });
    const set = res.headers.getSetCookie?.() ?? [];
    for (const c of set) { const [kv] = c.split(";"); this.cookie = kv.endsWith("=") ? "" : kv; this.raw = c; }
    const text = await res.text();
    let data; try { data = JSON.parse(text); } catch { data = text; }
    return { status: res.status, data, res };
  }
  get = (p) => this.req("GET", p);
  post = (p, b, e) => this.req("POST", p, b, e);
  put = (p, b) => this.req("PUT", p, b);
  patch = (p, b) => this.req("PATCH", p, b);
  del = (p) => this.req("DELETE", p);
}

async function t(name, fn) {
  try { await fn(); passed++; results.push(`  ok   ${name}`); }
  catch (e) { results.push(`  FALHA ${name}\n        ${e.message.split("\n")[0]}`); process.exitCode = 1; }
}

// PNG mínimo válido (1x1)
const crc = (buf) => { let c, crc = ~0; for (const b of buf) { c = (crc ^ b) & 0xff; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; crc = (crc >>> 8) ^ c; } return ~crc >>> 0; };
const chunk = (type, data) => { const t = Buffer.from(type), len = Buffer.alloc(4); len.writeUInt32BE(data.length); const c = Buffer.alloc(4); c.writeUInt32BE(crc(Buffer.concat([t, data]))); return Buffer.concat([len, t, data, c]); };
const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk("IHDR", Buffer.from([0, 0, 0, 1, 0, 0, 0, 1, 8, 2, 0, 0, 0])), chunk("IDAT", deflateSync(Buffer.from([0, 255, 0, 0]))), chunk("IEND", Buffer.alloc(0))]);
const upload = (buf, name = "foto.png", type = "image/png") => { const f = new FormData(); f.append("file", new Blob([buf], { type }), name); return f; };

const stamp = Date.now();
const email = `teste-${stamp}@exemplo.com`;
const pw = "uma-senha-forte-123";
const anon = new Client(), cust = new Client(), admin = new Client();

console.log(`Testando ${BASE}\n`);

await t("público: produtos, categorias e conteúdo", async () => {
  assert.equal((await anon.get("/api/products")).status, 200);
  assert.equal((await anon.get("/api/categories")).status, 200);
  const c = await anon.get("/api/content");
  assert.equal(c.status, 200); assert.ok(c.data.content["hero.title1"]); assert.equal(typeof c.data.sections.hero, "boolean");
});
await t("rotas admin bloqueadas sem login (401)", async () => {
  for (const p of ["/api/admin/products", "/api/admin/customers", "/api/admin/stats", "/api/admin/media", "/api/admin/quotes", "/api/admin/content"])
    assert.equal((await anon.get(p)).status, 401, p);
  assert.equal((await anon.put("/api/admin/content", { values: {} })).status, 401);
});

await t("cadastro: valida e-mail, senha curta e campos", async () => {
  assert.equal((await anon.post("/api/auth/register", { name: "X", email: "nao-e-email", password: pw })).status, 422);
  assert.equal((await anon.post("/api/auth/register", { name: "Maria", email, password: "curta" })).status, 422);
});
await t("cadastro de cliente + sessão por cookie HttpOnly", async () => {
  const r = await cust.post("/api/auth/register", { name: "Maria Teste", email, password: pw, phone: "(45) 99999-0000" });
  assert.equal(r.status, 201); assert.equal(r.data.role, "CLIENT");
  assert.match(cust.raw, /HttpOnly/i); assert.match(cust.raw, /SameSite=lax/i);
});
await t("cadastro: e-mail duplicado (mesmo com maiúsculas) é recusado", async () => {
  assert.equal((await new Client().post("/api/auth/register", { name: "Outra", email: email.toUpperCase(), password: pw })).status, 409);
});
await t("cadastro: tentar enviar role=ADMIN não eleva permissão", async () => {
  const c = new Client();
  const r = await c.post("/api/auth/register", { name: "Hacker", email: `h-${stamp}@exemplo.com`, password: pw, role: "ADMIN" });
  assert.equal(r.status, 201); assert.equal(r.data.role, "CLIENT");
  assert.equal((await c.get("/api/admin/stats")).status, 403);
  const me = await c.get("/api/auth/me"); assert.equal(me.data.user.role, "CLIENT");
  // limpeza feita pelo admin mais abaixo
});
await t("cliente: perfil, edição e /me", async () => {
  assert.equal((await cust.get("/api/auth/me")).data.user.email, email);
  const r = await cust.patch("/api/account", { name: "Maria Editada", phone: "" });
  assert.equal(r.status, 200); assert.equal(r.data.name, "Maria Editada"); assert.equal(r.data.phone, null);
});
await t("cliente NÃO acessa rotas admin (403) nem altera role pelo perfil", async () => {
  for (const p of ["/api/admin/products", "/api/admin/customers", "/api/admin/stats", "/api/admin/media"]) assert.equal((await cust.get(p)).status, 403, p);
  assert.equal((await cust.post("/api/admin/products", { name: "Invasor" })).status, 403);
  await cust.patch("/api/account", { name: "Maria", role: "ADMIN" });
  assert.equal((await cust.get("/api/auth/me")).data.user.role, "CLIENT");
});
await t("trocar senha: exige a atual; senha nova funciona", async () => {
  assert.equal((await cust.put("/api/account/password", { current: "errada-errada", password: "nova-senha-forte-1" })).status, 403);
  assert.equal((await cust.put("/api/account/password", { current: pw, password: "nova-senha-forte-1" })).status, 200);
  const l = new Client();
  assert.equal((await l.post("/api/auth/login", { email, password: pw })).status, 401);
  assert.equal((await l.post("/api/auth/login", { email, password: "nova-senha-forte-1" })).status, 200);
});
await t("logout encerra a sessão", async () => {
  const c = new Client(); await c.post("/api/auth/login", { email, password: "nova-senha-forte-1" });
  assert.equal((await c.post("/api/auth/logout")).status, 200);
  assert.equal((await c.get("/api/auth/me")).data.user, null);
});
await t("recuperação: resposta igual para e-mail existente e inexistente", async () => {
  const a = await anon.post("/api/auth/forgot", { email }), b = await anon.post("/api/auth/forgot", { email: `nao-existe-${stamp}@exemplo.com` });
  assert.equal(a.status, 200); assert.deepEqual(a.data, b.data);
});
await t("recuperação: token inválido é recusado", async () => {
  assert.equal((await anon.post("/api/auth/reset", { token: "x".repeat(43), password: "outra-senha-forte-1" })).status, 400);
});

await t("CSRF: origem externa é recusada", async () => {
  const r = await cust.req("PUT", "/api/account/password", { current: "a", password: "b".repeat(12) }, { headers: { origin: "https://evil.example" } });
  assert.equal(r.status, 403);
  assert.equal((await anon.post("/api/auth/login", { email, password: pw }, { headers: { origin: "https://evil.example" } })).status, 403);
});

if (ADMIN.email && ADMIN.password) {
  await t("admin: login e /me com role ADMIN", async () => {
    const r = await admin.post("/api/auth/login", ADMIN);
    assert.equal(r.status, 200); assert.equal(r.data.role, "ADMIN");
  });
  await t("admin: dashboard", async () => {
    const r = await admin.get("/api/admin/stats"); assert.equal(r.status, 200); assert.ok(r.data.customers.total >= 1);
  });
  let cid;
  await t("admin: busca clientes por nome/e-mail", async () => {
    const r = await admin.get(`/api/admin/customers?q=${encodeURIComponent(email.slice(0, 12))}`);
    assert.equal(r.status, 200); const m = r.data.find((c) => c.email === email); assert.ok(m); cid = m.id;
    assert.equal((await admin.get("/api/admin/customers?q=%25")).data.length, 0, "curinga % deve ser escapado");
  });
  await t("admin: edita e desativa cliente (derruba sessão e impede login)", async () => {
    const c = new Client(); await c.post("/api/auth/login", { email, password: "nova-senha-forte-1" });
    assert.equal((await admin.patch(`/api/admin/customers/${cid}`, { name: "Maria Admin", isActive: false })).status, 200);
    assert.equal((await c.get("/api/auth/me")).data.user, null);
    assert.equal((await new Client().post("/api/auth/login", { email, password: "nova-senha-forte-1" })).status, 401);
    assert.equal((await admin.patch(`/api/admin/customers/${cid}`, { isActive: true })).status, 200);
  });
  await t("admin: não consegue alterar outro admin pela API de clientes", async () => {
    const me = (await admin.get("/api/auth/me")).data.user;
    assert.equal((await admin.patch(`/api/admin/customers/${me.id}`, { name: "xx" })).status, 404);
    assert.equal((await admin.del(`/api/admin/customers/${me.id}`)).status, 404);
  });

  await t("orçamento: cliente logado fica vinculado; admin lista e muda status", async () => {
    const c = new Client(); await c.post("/api/auth/login", { email, password: "nova-senha-forte-1" });
    const q = await c.post("/api/quotes", { name: "Maria", whatsapp: "(45) 99999-0000", productType: "Naked Cake", idea: "teste" });
    assert.equal(q.status, 201);
    const d = await admin.get(`/api/admin/customers/${cid}`); assert.equal(d.data.quotes.length, 1);
    assert.equal((await admin.patch(`/api/admin/quotes/${q.data.id}`, { status: "em_contato" })).status, 200);
    assert.equal((await admin.patch(`/api/admin/quotes/${q.data.id}`, { status: "invalido" })).status, 422);
  });

  let catId, pid;
  await t("admin: categorias e produtos (criar, editar, ocultar, excluir)", async () => {
    const c = await admin.post("/api/admin/categories", { name: `Categoria ${stamp}`, description: "d" }); assert.equal(c.status, 201); catId = c.data.id;
    const p = await admin.post("/api/admin/products", { name: `Produto ${stamp}`, categoryId: catId, price: "R$ 10", image: "" }); assert.equal(p.status, 201); pid = p.data.id;
    assert.ok((await anon.get(`/api/products/${p.data.slug}`)).status === 200);
    assert.equal((await admin.put(`/api/admin/products/${pid}`, { name: `Produto ${stamp}`, categoryId: catId, active: false, price: "R$ 12" })).data.price, "R$ 12");
    assert.equal((await anon.get(`/api/products/${p.data.slug}`)).status, 404, "produto oculto não aparece no site");
    assert.equal((await admin.put(`/api/admin/products/${pid}`, { name: "x", image: "javascript:alert(1)" })).status, 422);
    assert.equal((await admin.del(`/api/admin/products/${pid}`)).status, 200);
    assert.equal((await admin.del(`/api/admin/categories/${catId}`)).status, 200);
  });

  await t("conteúdo: editar, validar e voltar ao padrão", async () => {
    const orig = (await anon.get("/api/content")).data.content["hero.title1"];
    assert.equal((await admin.put("/api/admin/content", { values: { "hero.title1": "<b>Olá</b>" } })).status, 200);
    assert.equal((await anon.get("/api/content")).data.content["hero.title1"], "<b>Olá</b>", "guardado como texto; o React escapa na tela");
    assert.equal((await admin.put("/api/admin/content", { values: { "social.instagram_url": "javascript:alert(1)" } })).status, 422);
    assert.equal((await admin.put("/api/admin/content", { values: { "contact.whatsapp": "abc" } })).status, 422);
    assert.equal((await admin.put("/api/admin/content", { values: { "campo.inexistente": "x" } })).status, 422);
    assert.equal((await admin.put("/api/admin/content", { values: { "hero.title1": "" } })).status, 200);
    assert.equal((await anon.get("/api/content")).data.content["hero.title1"], orig);
  });
  await t("seções: ativar/desativar", async () => {
    assert.equal((await admin.put("/api/admin/sections", { sections: { faq: true } })).data.sections.faq, true);
    assert.equal((await anon.get("/api/content")).data.sections.faq, true);
    assert.equal((await admin.put("/api/admin/sections", { sections: { faq: false } })).data.sections.faq, false);
    assert.equal((await admin.put("/api/admin/sections", { sections: { inexistente: true } })).status, 422);
  });

  await t("imagens: envia PNG, serve, usa no conteúdo, substitui e exclui", async () => {
    const u = await admin.post("/api/admin/media", upload(png)); assert.equal(u.status, 201); const { id, url } = u.data;
    const g = await anon.get(url); assert.equal(g.status, 200); assert.equal(g.res.headers.get("content-type"), "image/png"); assert.equal(g.res.headers.get("x-content-type-options"), "nosniff");
    await admin.put("/api/admin/content", { values: { "hero.image": url } });
    assert.equal((await admin.del(`/api/admin/media/${id}`)).status, 409, "imagem em uso não pode ser excluída");
    assert.equal((await admin.post(`/api/admin/media/${id}`, upload(png, "nova.png"))).status, 200);
    await admin.put("/api/admin/content", { values: { "hero.image": "" } });
    assert.equal((await admin.del(`/api/admin/media/${id}`)).status, 200);
    assert.equal((await anon.get(url)).status, 404);
  });
  await t("imagens: recusa arquivo malicioso/inválido", async () => {
    assert.equal((await admin.post("/api/admin/media", upload(Buffer.from("<script>alert(1)</script>"), "x.png", "image/png"))).status, 422, "HTML disfarçado de PNG");
    assert.equal((await admin.post("/api/admin/media", upload(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'), "x.svg", "image/svg+xml"))).status, 422, "SVG");
    assert.equal((await admin.post("/api/admin/media", upload(Buffer.concat([png, Buffer.alloc(6 * 1024 * 1024)])))).status, 422, "maior que 5 MB");
    assert.equal((await admin.post("/api/admin/media", new FormData())).status, 422, "sem arquivo");
    assert.equal((await anon.post("/api/admin/media", upload(png))).status, 401, "sem login");
    const cc = new Client(); await cc.post("/api/auth/register", { name: "Cli Dois", email: `c2-${stamp}@exemplo.com`, password: pw });
    assert.equal((await cc.post("/api/admin/media", upload(png))).status, 403, "cliente");
  });

  await t("admin: exclui os clientes de teste (orçamento é mantido)", async () => {
    assert.equal((await admin.del(`/api/admin/customers/${cid}`)).status, 200);
    for (const q of [`h-${stamp}`, `c2-${stamp}`]) for (const c of (await admin.get(`/api/admin/customers?q=${q}`)).data) await admin.del(`/api/admin/customers/${c.id}`);
  });

  await t("sessão do admin: logout bloqueia o painel", async () => {
    await admin.post("/api/auth/logout"); assert.equal((await admin.get("/api/admin/stats")).status, 401);
  });
} else console.log("(sem ADMIN_EMAIL/ADMIN_PASSWORD: testes de admin pulados)\n");

await t("limite de tentativas de login (429 após 5 falhas)", async () => {
  const c = new Client(); let last;
  for (let i = 0; i < 7; i++) last = await c.post("/api/auth/login", { email: `bloqueio-${stamp}@exemplo.com`, password: "errada" + i });
  assert.equal(last.status, 429);
});

console.log(results.join("\n"));
console.log(`\n${passed}/${results.length} testes passaram`);

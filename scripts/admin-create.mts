import "./env";
import { createInterface } from "node:readline/promises";
import { db } from "../lib/server/db";
import { hashPassword } from "../lib/server/auth-hash";

// Cria (ou atualiza) um administrador. Pede nome, e-mail e senha no terminal.
// Também aceita: npm run admin:create -- email@exemplo.com "Nome"   e   ADMIN_PASSWORD=... (uso não interativo)

function ask(q: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return rl.question(q).finally(() => rl.close());
}

// Leitura sem eco usando modo raw: funciona no PowerShell, CMD, macOS e Linux.
function askHidden(q: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const stdin = process.stdin;
    if (!stdin.isTTY) return reject(new Error("Terminal não interativo: defina ADMIN_PASSWORD."));
    process.stdout.write(q);
    let value = "";
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    const onData = (chunk: string) => {
      for (const ch of chunk) {
        if (ch === "\r" || ch === "\n") {
          stdin.setRawMode(false);
          stdin.pause();
          stdin.off("data", onData);
          process.stdout.write("\n");
          return resolve(value);
        }
        if (ch === "\u0003") { process.stdout.write("\n"); process.exit(130); } // Ctrl+C
        if (ch === "\u007f" || ch === "\b") value = value.slice(0, -1);
        else if (ch >= " ") value += ch;
      }
    };
    stdin.on("data", onData);
  });
}

const [argEmail, argName] = process.argv.slice(2);
const email = (argEmail ?? (await ask("E-mail: "))).trim().toLowerCase();
if (!/^\S+@\S+\.\S+$/.test(email)) { console.error("E-mail inválido."); process.exit(1); }
const name = (argName ?? (await ask("Nome: "))).trim();
if (name.length < 2) { console.error("Informe o nome."); process.exit(1); }

let pw = process.env.ADMIN_PASSWORD;
if (!pw) {
  pw = await askHidden("Senha (mín. 12 caracteres): ");
  if (pw !== (await askHidden("Repita a senha: "))) { console.error("As senhas não conferem."); process.exit(1); }
}
if (pw.length < 12) { console.error("Senha curta demais (mínimo 12 caracteres)."); process.exit(1); }

const existing = (await db().query("SELECT id, role FROM users WHERE lower(email)=$1", [email])).rows[0];
if (existing && existing.role !== "ADMIN" && process.env.PROMOTE !== "yes") {
  // um cliente nunca é promovido por engano
  console.error("Já existe uma conta de CLIENTE com esse e-mail. Para promovê-la a ADMIN rode com PROMOTE=yes.");
  process.exit(1);
}

const hash = await hashPassword(pw);
if (existing) {
  await db().query("UPDATE users SET name=$2, password_hash=$3, role='ADMIN', is_active=true, updated_at=now() WHERE id=$1", [existing.id, name, hash]);
  await db().query("DELETE FROM sessions WHERE user_id=$1", [existing.id]); // trocar a senha encerra as sessões abertas
  console.log(`Administrador ${email} atualizado.`);
} else {
  await db().query("INSERT INTO users (email, name, password_hash, role) VALUES ($1,$2,$3,'ADMIN')", [email, name, hash]);
  console.log(`Administrador ${email} criado.`);
}
await db().end();

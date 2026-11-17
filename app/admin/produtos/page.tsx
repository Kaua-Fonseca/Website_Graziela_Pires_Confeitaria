"use client";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/components/admin/api";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { Confirm, Loading, Modal, PageHead, useToast } from "@/components/admin/ui";

type Product = { id: number; slug: string; name: string; categoryId: number | null; image: string; price: string; detail: string; active: boolean; position: number };
type Category = { id: number; slug: string; name: string; description: string; image: string; position: number };

const emptyP = { name: "", categoryId: null as number | null, image: "", price: "", detail: "", active: true, position: 0 };
const emptyC = { name: "", description: "", image: "", position: 0 };

export default function ProductsPage() {
  const toast = useToast();
  const [tab, setTab] = useState<"p" | "c">("p");
  const [products, setProducts] = useState<Product[] | null>(null);
  const [cats, setCats] = useState<Category[] | null>(null);
  const [editP, setEditP] = useState<(typeof emptyP & { id?: number }) | null>(null);
  const [editC, setEditC] = useState<(typeof emptyC & { id?: number }) | null>(null);
  const [del, setDel] = useState<{ kind: "p" | "c"; id: number; name: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const [p, c] = await Promise.all([api<Product[]>("GET", "/api/admin/products"), api<Category[]>("GET", "/api/admin/categories")]);
      setProducts(p); setCats(c);
    } catch (e: any) { toast.err(e.message); }
  }, []); // eslint-disable-line
  useEffect(() => { load(); }, [load]);

  if (!products || !cats) return <><PageHead title="Produtos e categorias" /><Loading /></>;
  const catName = (id: number | null) => cats.find((c) => c.id === id)?.name ?? "Sem categoria";

  async function saveP() {
    const f = editP!;
    if (f.name.trim().length < 2) return toast.err("Informe o nome do produto");
    setBusy(true);
    try {
      const body = { name: f.name.trim(), categoryId: f.categoryId, image: f.image.trim(), price: f.price.trim() || "Sob consulta", detail: f.detail.trim(), active: f.active, position: Number(f.position) || 0 };
      await api(f.id ? "PUT" : "POST", f.id ? `/api/admin/products/${f.id}` : "/api/admin/products", body);
      toast.ok(f.id ? "Produto atualizado" : "Produto criado"); setEditP(null); load();
    } catch (e: any) { toast.err(e.message); } finally { setBusy(false); }
  }
  async function saveC() {
    const f = editC!;
    if (f.name.trim().length < 2) return toast.err("Informe o nome da categoria");
    setBusy(true);
    try {
      const body = { name: f.name.trim(), description: f.description.trim(), image: f.image.trim(), position: Number(f.position) || 0 };
      await api(f.id ? "PUT" : "POST", f.id ? `/api/admin/categories/${f.id}` : "/api/admin/categories", body);
      toast.ok(f.id ? "Categoria atualizada" : "Categoria criada"); setEditC(null); load();
    } catch (e: any) { toast.err(e.message); } finally { setBusy(false); }
  }
  async function remove() {
    if (!del) return;
    setBusy(true);
    try {
      await api("DELETE", `/api/admin/${del.kind === "p" ? "products" : "categories"}/${del.id}`);
      toast.ok("Excluído"); setDel(null); load();
    } catch (e: any) { toast.err(e.message); } finally { setBusy(false); }
  }
  async function toggleActive(p: Product) {
    try {
      await api("PUT", `/api/admin/products/${p.id}`, { name: p.name, categoryId: p.categoryId, image: p.image, price: p.price, detail: p.detail, active: !p.active, position: p.position });
      toast.ok(p.active ? "Produto ocultado do site" : "Produto visível no site"); load();
    } catch (e: any) { toast.err(e.message); }
  }

  return (
    <>
      <PageHead title="Produtos e categorias" sub="O que aparece no catálogo e na página inicial.">
        {tab === "p" ? <button className="adm-btn" onClick={() => setEditP({ ...emptyP })}>+ Novo produto</button> : <button className="adm-btn" onClick={() => setEditC({ ...emptyC })}>+ Nova categoria</button>}
      </PageHead>
      <div className="adm-tabs" role="tablist">
        <button role="tab" aria-selected={tab === "p"} className={tab === "p" ? "active" : ""} onClick={() => setTab("p")}>Produtos ({products.length})</button>
        <button role="tab" aria-selected={tab === "c"} className={tab === "c" ? "active" : ""} onClick={() => setTab("c")}>Categorias ({cats.length})</button>
      </div>

      {tab === "p" && (products.length === 0 ? <p className="adm-empty">Nenhum produto cadastrado.</p> : (
        <ul className="adm-list">
          {products.map((p) => (
            <li key={p.id} className={`adm-item ${p.active ? "" : "off"}`}>
              <div className="adm-item-img">{p.image ? <img src={p.image} alt="" /> : <em>—</em>}</div>
              <div className="adm-item-main">
                <strong>{p.name}</strong>
                <span className="adm-muted">{catName(p.categoryId)} · {p.price}</span>
                {!p.active && <span className="adm-pill st-descartado">Oculto no site</span>}
              </div>
              <div className="adm-item-actions">
                <button className="adm-btn small ghost" onClick={() => toggleActive(p)}>{p.active ? "Ocultar" : "Mostrar"}</button>
                <button className="adm-btn small" onClick={() => setEditP({ ...p })}>Editar</button>
                <button className="adm-btn small danger-ghost" onClick={() => setDel({ kind: "p", id: p.id, name: p.name })}>Excluir</button>
              </div>
            </li>
          ))}
        </ul>
      ))}

      {tab === "c" && (cats.length === 0 ? <p className="adm-empty">Nenhuma categoria cadastrada.</p> : (
        <ul className="adm-list">
          {cats.map((c) => (
            <li key={c.id} className="adm-item">
              <div className="adm-item-img">{c.image ? <img src={c.image} alt="" /> : <em>—</em>}</div>
              <div className="adm-item-main"><strong>{c.name}</strong><span className="adm-muted">{c.description || "Sem descrição"}</span></div>
              <div className="adm-item-actions">
                <button className="adm-btn small" onClick={() => setEditC({ ...c })}>Editar</button>
                <button className="adm-btn small danger-ghost" onClick={() => setDel({ kind: "c", id: c.id, name: c.name })}>Excluir</button>
              </div>
            </li>
          ))}
        </ul>
      ))}

      {editP && (
        <Modal title={editP.id ? "Editar produto" : "Novo produto"} onClose={() => setEditP(null)}>
          <div className="adm-form-grid">
            <label className="adm-field full"><span>Nome</span><input value={editP.name} maxLength={120} onChange={(e) => setEditP({ ...editP, name: e.target.value })} autoFocus /></label>
            <label className="adm-field"><span>Categoria</span>
              <select value={editP.categoryId ?? ""} onChange={(e) => setEditP({ ...editP, categoryId: e.target.value ? Number(e.target.value) : null })}>
                <option value="">Sem categoria</option>
                {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <label className="adm-field"><span>Preço (texto)</span><input value={editP.price} maxLength={60} placeholder="A partir de R$ 165" onChange={(e) => setEditP({ ...editP, price: e.target.value })} /></label>
            <label className="adm-field full"><span>Descrição</span><textarea rows={3} maxLength={500} value={editP.detail} onChange={(e) => setEditP({ ...editP, detail: e.target.value })} /></label>
            <div className="full"><MediaPicker label="Imagem" value={editP.image} onChange={(v) => setEditP({ ...editP, image: v })} /></div>
            <label className="adm-field"><span>Posição (menor aparece primeiro)</span><input type="number" min={0} value={editP.position} onChange={(e) => setEditP({ ...editP, position: Number(e.target.value) })} /></label>
            <label className="adm-check"><input type="checkbox" checked={editP.active} onChange={(e) => setEditP({ ...editP, active: e.target.checked })} /> Visível no site</label>
          </div>
          <div className="adm-actions"><button className="adm-btn ghost" onClick={() => setEditP(null)}>Cancelar</button><button className="adm-btn" disabled={busy} onClick={saveP}>{busy ? "Salvando…" : "Salvar"}</button></div>
        </Modal>
      )}
      {editC && (
        <Modal title={editC.id ? "Editar categoria" : "Nova categoria"} onClose={() => setEditC(null)}>
          <div className="adm-form-grid">
            <label className="adm-field full"><span>Nome</span><input value={editC.name} maxLength={80} onChange={(e) => setEditC({ ...editC, name: e.target.value })} autoFocus /></label>
            <label className="adm-field full"><span>Descrição</span><textarea rows={2} maxLength={300} value={editC.description} onChange={(e) => setEditC({ ...editC, description: e.target.value })} /></label>
            <div className="full"><MediaPicker label="Imagem" value={editC.image} onChange={(v) => setEditC({ ...editC, image: v })} /></div>
            <label className="adm-field"><span>Posição</span><input type="number" min={0} value={editC.position} onChange={(e) => setEditC({ ...editC, position: Number(e.target.value) })} /></label>
          </div>
          <div className="adm-actions"><button className="adm-btn ghost" onClick={() => setEditC(null)}>Cancelar</button><button className="adm-btn" disabled={busy} onClick={saveC}>{busy ? "Salvando…" : "Salvar"}</button></div>
        </Modal>
      )}
      {del && (
        <Confirm title={del.kind === "p" ? "Excluir produto?" : "Excluir categoria?"} busy={busy} onCancel={() => setDel(null)} onConfirm={remove}
          message={del.kind === "p" ? <>“{del.name}” será removido definitivamente. Para só tirar do site, use <b>Ocultar</b>.</> : <>“{del.name}” será removida. Os produtos dela ficam sem categoria.</>} />
      )}
    </>
  );
}

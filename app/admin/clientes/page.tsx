"use client";
import { useCallback, useEffect, useState } from "react";
import { api, fmtDate } from "@/components/admin/api";
import { Confirm, Loading, Modal, PageHead, useToast } from "@/components/admin/ui";

type Customer = { id: string; name: string; email: string; phone: string | null; isActive: boolean; createdAt: string };
type Detail = Customer & { quotes: { id: number; status: string; productType: string | null; createdAt: string }[] };

export default function CustomersPage() {
  const toast = useToast();
  const [q, setQ] = useState("");
  const [list, setList] = useState<Customer[] | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [del, setDel] = useState<Customer | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback((term: string) =>
    api<Customer[]>("GET", `/api/admin/customers?q=${encodeURIComponent(term)}`).then(setList).catch((e) => toast.err(e.message)), []); // eslint-disable-line
  useEffect(() => { const t = setTimeout(() => load(q), 300); return () => clearTimeout(t); }, [q, load]);

  async function open(id: string) {
    try {
      const d = await api<Detail>("GET", `/api/admin/customers/${id}`);
      setDetail(d); setForm({ name: d.name, email: d.email, phone: d.phone ?? "" });
    } catch (e: any) { toast.err(e.message); }
  }
  async function save() {
    if (!detail) return;
    setBusy(true);
    try {
      const u = await api<Customer>("PATCH", `/api/admin/customers/${detail.id}`, { name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() });
      toast.ok("Cliente atualizado"); setDetail({ ...detail, ...u }); load(q);
    } catch (e: any) { toast.err(e.message); } finally { setBusy(false); }
  }
  async function setActive(c: Customer, isActive: boolean) {
    try {
      await api("PATCH", `/api/admin/customers/${c.id}`, { isActive });
      toast.ok(isActive ? "Conta reativada" : "Conta desativada (sessões encerradas)");
      if (detail?.id === c.id) setDetail({ ...detail, isActive });
      load(q);
    } catch (e: any) { toast.err(e.message); }
  }
  async function remove() {
    if (!del) return;
    setBusy(true);
    try { await api("DELETE", `/api/admin/customers/${del.id}`); toast.ok("Conta excluída"); setDel(null); setDetail(null); load(q); }
    catch (e: any) { toast.err(e.message); } finally { setBusy(false); }
  }

  return (
    <>
      <PageHead title="Clientes" sub="Contas criadas no site." />
      <label className="adm-field adm-search"><span className="adm-sr">Buscar</span><input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome ou e-mail…" /></label>
      {!list ? <Loading /> : list.length === 0 ? <p className="adm-empty">{q ? "Nenhum cliente encontrado." : "Ainda não há clientes cadastrados."}</p> : (
        <ul className="adm-list">
          {list.map((c) => (
            <li key={c.id} className={`adm-item ${c.isActive ? "" : "off"}`}>
              <div className="adm-item-main">
                <strong>{c.name}</strong>
                <span className="adm-muted">{c.email}{c.phone ? ` · ${c.phone}` : ""}</span>
                <span className="adm-muted">Desde {fmtDate(c.createdAt)} {!c.isActive && <span className="adm-pill st-descartado">Desativada</span>}</span>
              </div>
              <div className="adm-item-actions">
                <button className="adm-btn small" onClick={() => open(c.id)}>Ver / editar</button>
                <button className="adm-btn small ghost" onClick={() => setActive(c, !c.isActive)}>{c.isActive ? "Desativar" : "Reativar"}</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {detail && (
        <Modal title="Cliente" onClose={() => setDetail(null)}>
          <div className="adm-form-grid">
            <label className="adm-field full"><span>Nome</span><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
            <label className="adm-field"><span>E-mail</span><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
            <label className="adm-field"><span>Telefone</span><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
          </div>
          <p className="adm-muted">Cadastro em {fmtDate(detail.createdAt)} · {detail.isActive ? "conta ativa" : "conta desativada"}</p>
          <h3 className="adm-sub">Orçamentos ({detail.quotes.length})</h3>
          {detail.quotes.length === 0 ? <p className="adm-muted">Nenhum orçamento ligado a esta conta.</p> : (
            <ul className="adm-mini">{detail.quotes.map((x) => <li key={x.id}>#{x.id} · {x.productType ?? "—"} · {fmtDate(x.createdAt)} · <span className={`adm-pill st-${x.status}`}>{x.status.replace("_", " ")}</span></li>)}</ul>
          )}
          <div className="adm-actions spread">
            <button className="adm-btn danger-ghost" onClick={() => setDel(detail)}>Excluir conta</button>
            <span className="adm-row"><button className="adm-btn ghost" onClick={() => setActive(detail, !detail.isActive)}>{detail.isActive ? "Desativar" : "Reativar"}</button><button className="adm-btn" disabled={busy} onClick={save}>Salvar</button></span>
          </div>
        </Modal>
      )}
      {del && <Confirm title="Excluir conta do cliente?" typeToConfirm="EXCLUIR" busy={busy} onCancel={() => setDel(null)} onConfirm={remove}
        message={<>A conta de <b>{del.name}</b> será apagada de forma definitiva. Os orçamentos enviados por ela continuam registrados. Se só quiser bloquear o acesso, use <b>Desativar</b>.</>} />}
    </>
  );
}

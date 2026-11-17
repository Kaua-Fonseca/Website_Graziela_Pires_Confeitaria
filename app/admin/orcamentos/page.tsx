"use client";
import { useCallback, useEffect, useState } from "react";
import { api, fmtDate, fmtDay, waLink } from "@/components/admin/api";
import { Loading, PageHead, useToast } from "@/components/admin/ui";

type Quote = { id: number; name: string; whatsapp: string; desiredDate: string | null; productType: string | null; idea: string; status: string; createdAt: string };
const STATUS: [string, string][] = [["novo", "Novo"], ["em_contato", "Em contato"], ["fechado", "Fechado"], ["descartado", "Descartado"]];

export default function QuotesPage() {
  const toast = useToast();
  const [status, setStatus] = useState("");
  const [list, setList] = useState<Quote[] | null>(null);

  const load = useCallback((s: string) => api<Quote[]>("GET", `/api/admin/quotes${s ? `?status=${s}` : ""}`).then(setList).catch((e) => toast.err(e.message)), []); // eslint-disable-line
  useEffect(() => { setList(null); load(status); }, [status, load]);

  async function change(q: Quote, next: string) {
    const prev = list;
    setList((l) => l!.map((x) => (x.id === q.id ? { ...x, status: next } : x)));
    try { await api("PATCH", `/api/admin/quotes/${q.id}`, { status: next }); toast.ok("Situação atualizada"); if (status && status !== next) load(status); }
    catch (e: any) { setList(prev); toast.err(e.message); }
  }

  return (
    <>
      <PageHead title="Orçamentos" sub="Pedidos enviados pelo formulário do site." />
      <div className="adm-tabs" role="tablist">
        <button role="tab" aria-selected={!status} className={!status ? "active" : ""} onClick={() => setStatus("")}>Todos</button>
        {STATUS.map(([k, l]) => <button key={k} role="tab" aria-selected={status === k} className={status === k ? "active" : ""} onClick={() => setStatus(k)}>{l}</button>)}
      </div>
      {!list ? <Loading /> : list.length === 0 ? <p className="adm-empty">Nenhum orçamento nesta situação.</p> : (
        <ul className="adm-list">
          {list.map((q) => {
            const wa = waLink(q.whatsapp);
            return (
              <li key={q.id} className="adm-item col">
                <div className="adm-item-head">
                  <strong>#{q.id} · {q.name}</strong>
                  <span className="adm-muted">{fmtDate(q.createdAt)}</span>
                </div>
                <div className="adm-kv">
                  <span><b>WhatsApp</b>{q.whatsapp}</span>
                  <span><b>Produto</b>{q.productType ?? "—"}</span>
                  <span><b>Data desejada</b>{fmtDay(q.desiredDate)}</span>
                </div>
                {q.idea && <p className="adm-idea">{q.idea}</p>}
                <div className="adm-item-foot">
                  <label className="adm-inline"><span>Situação</span>
                    <select value={q.status} onChange={(e) => change(q, e.target.value)}>{STATUS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
                  </label>
                  {wa ? <a className="adm-btn small" href={wa} target="_blank" rel="noreferrer">Abrir WhatsApp ↗</a> : <span className="adm-muted">WhatsApp sem formato válido</span>}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

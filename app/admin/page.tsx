"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/components/admin/api";
import { Loading, PageHead, useToast } from "@/components/admin/ui";

type Stats = {
  customers: { total: number; active: number; lastWeek: number };
  quotes: Record<string, number>;
  products: { total: number; active: number };
  media: { total: number };
};

const QL: Record<string, string> = { novo: "Novos", em_contato: "Em contato", fechado: "Fechados", descartado: "Descartados" };

export default function Dashboard() {
  const toast = useToast();
  const [s, setS] = useState<Stats | null>(null);
  useEffect(() => { api<Stats>("GET", "/api/admin/stats").then(setS).catch((e) => toast.err(e.message)); }, []); // eslint-disable-line
  if (!s) return <><PageHead title="Dashboard" /><Loading /></>;
  const totalQuotes = Object.values(s.quotes).reduce((a, b) => a + b, 0);
  return (
    <>
      <PageHead title="Dashboard" sub="Resumo do site." />
      <div className="adm-cards">
        <Card label="Clientes cadastrados" value={s.customers.total} note={`${s.customers.active} ativos · ${s.customers.lastWeek} novos em 7 dias`} href="/admin/clientes" />
        <Card label="Orçamentos novos" value={s.quotes.novo ?? 0} note={`${totalQuotes} no total`} href="/admin/orcamentos" accent />
        <Card label="Produtos no site" value={s.products.active} note={`${s.products.total} cadastrados`} href="/admin/produtos" />
        <Card label="Imagens" value={s.media.total} note="na biblioteca" href="/admin/imagens" />
      </div>
      <section className="adm-panel">
        <h2>Orçamentos por situação</h2>
        <div className="adm-pills">
          {Object.entries(QL).map(([k, l]) => <span key={k} className={`adm-pill st-${k}`}>{l}: <b>{s.quotes[k] ?? 0}</b></span>)}
        </div>
      </section>
      <section className="adm-panel">
        <h2>Acesso rápido</h2>
        <div className="adm-quick">
          <Link className="adm-btn" href="/admin/produtos">Cadastrar produto</Link>
          <Link className="adm-btn" href="/admin/conteudo">Editar textos do site</Link>
          <Link className="adm-btn" href="/admin/imagens">Enviar fotos</Link>
          <Link className="adm-btn ghost" href="/admin/orcamentos">Ver orçamentos</Link>
          <a className="adm-btn ghost" href="/" target="_blank" rel="noreferrer">Ver site ↗</a>
        </div>
      </section>
    </>
  );
}

function Card({ label, value, note, href, accent }: { label: string; value: number; note: string; href: string; accent?: boolean }) {
  return (
    <Link href={href} className={`adm-card ${accent ? "accent" : ""}`}>
      <span>{label}</span><strong>{value}</strong><small>{note}</small>
    </Link>
  );
}

"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { markAdminNav, ToastProvider } from "./ui";

const NAV = [
  ["/admin", "Dashboard"],
  ["/admin/conteudo", "Conteúdo e seções"],
  ["/admin/produtos", "Produtos e categorias"],
  ["/admin/imagens", "Imagens"],
  ["/admin/clientes", "Clientes"],
  ["/admin/orcamentos", "Orçamentos"],
] as const;

export function AdminShell({ name, children }: { name: string; children: ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); markAdminNav(); }, [path]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <ToastProvider>
      <div className="adm-shell">
        <header className="adm-topbar">
          <button className="adm-icon" aria-label="Abrir menu" aria-expanded={open} onClick={() => setOpen(!open)}>☰</button>
          <strong>Painel · Graziela Pires</strong>
        </header>
        {open && <div className="adm-scrim" onClick={() => setOpen(false)} />}
        <aside className={`adm-side ${open ? "open" : ""}`}>
          <div className="adm-brand"><span className="adm-eyebrow">PAINEL</span><strong>Graziela Pires</strong></div>
          <nav aria-label="Seções do painel">
            {NAV.map(([href, label]) => (
              <Link key={href} href={href} className={path === href ? "active" : ""} aria-current={path === href ? "page" : undefined}>{label}</Link>
            ))}
          </nav>
          <div className="adm-side-foot">
            <a href="/" target="_blank" rel="noreferrer">Ver site ↗</a>
            <span className="adm-muted">{name}</span>
            <button className="adm-btn ghost small" onClick={logout}>Sair</button>
          </div>
        </aside>
        <main className="adm-main">{children}</main>
      </div>
    </ToastProvider>
  );
}

import { useEffect, useState } from "react";
import type { GoFn, View } from "@/lib/types";
import type { Route } from "@/lib/router";
import { STATIC, useSite } from "@/lib/site";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Link } from "@/components/ui/Link";
import { Logo } from "@/components/ui/Logo";

export function Navbar({ go, route }: { go: GoFn; route: Route }) {
  const [open, setOpen] = useState(false);
  const { on, user } = useSite();

  const items: { label: string; view: View; anchor?: string; secondary?: boolean }[] = [
    { label: "Início", view: "home" },
    ...(on("page.catalog") ? [{ label: "Catálogo", view: "catalogo" as View }] : []),
    ...(on("page.showroom") ? [{ label: "Showroom", view: "showroom" as View }] : []),
    ...(on("journey") || on("about") ? [{ label: "Como funciona", view: "home" as View, anchor: "processo", secondary: true }] : []),
  ];
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  const isActive = (v: View, a?: string) => route.view === v && (route.anchor ?? undefined) === a;
  const nav = (v: View, a?: string) => { go(v, a); setOpen(false); };

  return (
    <header className="navbar">
      <div className="nav-inner">
        <Link onClick={() => nav("home")} className="brand-link"><Logo /></Link>
        <nav className={`nav-links ${open ? "open" : ""}`} aria-label="Principal">
          {items.map((i) => (
            <Link key={i.label} current={isActive(i.view, i.anchor)} className={i.secondary ? "nav-secondary" : ""} onClick={() => nav(i.view, i.anchor)}>{i.label}</Link>
          ))}
          {!STATIC && (user?.role === "ADMIN" ? <a href="/admin" className="nav-secondary">Painel</a> : null)}
          {!STATIC && (
            user
              ? <Link current={route.view === "conta"} className="nav-account" onClick={() => nav("conta")}>Minha conta</Link>
              : <Link current={route.view === "entrar" || route.view === "cadastro"} className="nav-account" onClick={() => nav("entrar")}>Entrar</Link>
          )}
          <Button onClick={() => nav("orcamento")}>
            Solicitar orçamento <Icon name="arrow" size={17} />
          </Button>
        </nav>
        <Button variant="ghost" className="menu-button" onClick={() => setOpen(!open)} label={open ? "Fechar menu" : "Abrir menu"}>
          <Icon name={open ? "close" : "menu"} />
        </Button>
      </div>
    </header>
  );
}

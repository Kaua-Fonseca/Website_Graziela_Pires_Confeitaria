import { useState } from "react";
import type { GoFn, View } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Link } from "@/components/ui/Link";
import { Logo } from "@/components/ui/Logo";

const items: [string, View, string?][] = [
  ["Início", "home"],
  ["Catálogo", "catalogo"],
  ["Showroom", "showroom"],
  ["Como funciona", "home", "processo"],
];

export function Navbar({ go }: { go: GoFn }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="navbar">
      <div className="nav-inner">
        <Link onClick={() => go("home")} className="brand-link"><Logo /></Link>
        <nav className={`nav-links ${open ? "open" : ""}`}>
          {items.map(([label, view, anchor]) => (
            <Link key={label} onClick={() => { go(view, anchor); setOpen(false); }}>{label}</Link>
          ))}
          <Button onClick={() => { go("orcamento"); setOpen(false); }}>
            Solicitar orçamento <Icon name="arrow" size={17} />
          </Button>
        </nav>
        <Button variant="ghost" className="menu-button" onClick={() => setOpen(!open)}>
          <Icon name={open ? "close" : "menu"} />
        </Button>
      </div>
    </header>
  );
}

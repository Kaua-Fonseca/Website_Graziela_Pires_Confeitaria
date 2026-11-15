import type { GoFn } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Link } from "@/components/ui/Link";
import { Logo } from "@/components/ui/Logo";

export function Footer({ go }: { go: GoFn }) {
  return (
    <footer>
      <div className="footer-top">
        <Logo light />
        <p>Bolos e doces artesanais personalizados para celebrar histórias únicas.</p>
        <div className="footer-social">
          <Button variant="ghost"><Icon name="instagram" /></Button>
          <Button variant="ghost"><Icon name="whatsapp" /></Button>
        </div>
      </div>
      <div className="footer-links">
        <div>
          <strong>EXPLORE</strong>
          <Link onClick={() => go("home")}>Início</Link>
          <Link onClick={() => go("catalogo")}>Produtos</Link>
          <Link onClick={() => go("showroom")}>Showroom</Link>
        </div>
        <div>
          <strong>INFORMAÇÕES</strong>
          <Link onClick={() => go("home", "sobre")}>Sobre</Link>
          <Link onClick={() => go("home", "processo")}>Como funciona</Link>
          <Link onClick={() => go("orcamento")}>Contato</Link>
        </div>
        <div>
          <strong>ATENDIMENTO</strong>
          <span>Foz do Iguaçu — Paraná</span>
          <span>Ter a Sáb · 9h às 18h</span>
          <Link>WhatsApp: (45) 99999-9999</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2025 Graziela Pires Confeitaria</span>
        <span>Feito artesanalmente em Foz do Iguaçu</span>
      </div>
    </footer>
  );
}

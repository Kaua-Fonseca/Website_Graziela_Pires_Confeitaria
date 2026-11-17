import type { GoFn } from "@/lib/types";
import { waUrl } from "@/lib/client";
import { useSite } from "@/lib/site";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Link } from "@/components/ui/Link";
import { Logo } from "@/components/ui/Logo";

const fmtPhone = (n: string) => {
  const d = n.replace(/\D/g, "").replace(/^55(?=\d{10,11}$)/, "");
  return d.length === 11 ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}` : d.length === 10 ? `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}` : n;
};

export function Footer({ go }: { go: GoFn }) {
  const { c, on } = useSite();
  const wa = c("contact.whatsapp") ? waUrl(c("contact.whatsapp")) : "";
  const insta = c("social.instagram_url");
  const email = c("contact.email");
  return (
    <footer>
      <div className="footer-top">
        <Logo light />
        <p>{c("footer.tagline")}</p>
        <div className="footer-social">
          {insta && <Button variant="ghost" href={insta} label="Instagram"><Icon name="instagram" /></Button>}
          {wa && <Button variant="ghost" href={wa} label="WhatsApp"><Icon name="whatsapp" /></Button>}
        </div>
      </div>
      <div className="footer-links">
        <div>
          <strong>EXPLORE</strong>
          <Link onClick={() => go("home")}>Início</Link>
          {on("page.catalog") && <Link onClick={() => go("catalogo")}>Produtos</Link>}
          {on("page.showroom") && <Link onClick={() => go("showroom")}>Showroom</Link>}
        </div>
        <div>
          <strong>INFORMAÇÕES</strong>
          {on("about") && <Link onClick={() => go("home", "sobre")}>Sobre</Link>}
          {(on("journey") || on("about")) && <Link onClick={() => go("home", "processo")}>Como funciona</Link>}
          <Link onClick={() => go("orcamento")}>Contato</Link>
        </div>
        <div>
          <strong>ATENDIMENTO</strong>
          {c("contact.city") && <span>{c("contact.city")}</span>}
          {c("contact.hours") && <span>{c("contact.hours")}</span>}
          {wa && <a href={wa} target="_blank" rel="noopener noreferrer">WhatsApp: {fmtPhone(c("contact.whatsapp"))}</a>}
          {email && <a href={`mailto:${email}`}>{email}</a>}
        </div>
      </div>
      <div className="footer-bottom">
        <span>{c("footer.copyright")}</span>
        <span>Feito artesanalmente em Foz do Iguaçu</span>
      </div>
    </footer>
  );
}

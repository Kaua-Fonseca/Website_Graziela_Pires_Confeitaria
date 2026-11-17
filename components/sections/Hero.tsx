import type { GoFn } from "@/lib/types";
import { photos } from "@/data/photos";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Title } from "@/components/ui/Title";
import { useSite } from "@/lib/site";

export function Hero({ go }: { go: GoFn }) {
  const { c } = useSite();
  return (
    <section className="hero">
      <div className="hero-copy">
        <span className="eyebrow reveal">{c("hero.eyebrow")}</span>
        <Title level={1}>{c("hero.title1")}<br /><em>{c("hero.title2")}</em></Title>
        <p>{c("hero.text")}</p>
        <div className="button-row">
          <Button onClick={() => go("orcamento")}>Pedir orçamento <Icon name="arrow" size={18} /></Button>
          <Button variant="secondary" onClick={() => go("catalogo")}>Ver catálogo</Button>
        </div>
        <div className="hero-note"><span>Desde 2019</span><i /><span>Foz do Iguaçu</span><i /><span>Sob encomenda</span></div>
      </div>
      <div className="hero-image-wrap">
        <div className="hero-photo"><img src={c("hero.image") || photos.hero} alt="Bolo artesanal floral em uma celebração elegante" /></div>
        <div className="hero-stamp"><small>{c("hero.stamp1")}</small><strong>{c("hero.stamp2")}</strong></div>
      </div>
      <div className="scroll-cue"><span>DESCUBRA</span><i /></div>
    </section>
  );
}

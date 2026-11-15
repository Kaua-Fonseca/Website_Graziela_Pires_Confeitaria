import type { GoFn } from "@/lib/types";
import { photos } from "@/data/photos";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Title } from "@/components/ui/Title";

export function Hero({ go }: { go: GoFn }) {
  return (
    <section className="hero">
      <div className="hero-copy">
        <span className="eyebrow reveal">CONFEITARIA ARTESANAL · FOZ DO IGUAÇU</span>
        <Title level={1}>Seu momento,<br /><em>em forma de doce.</em></Title>
        <p>Bolos e doces personalizados, feitos à mão para a sua celebração.</p>
        <div className="button-row">
          <Button onClick={() => go("orcamento")}>Pedir orçamento <Icon name="arrow" size={18} /></Button>
          <Button variant="secondary" onClick={() => go("catalogo")}>Ver catálogo</Button>
        </div>
        <div className="hero-note"><span>Desde 2019</span><i /><span>Foz do Iguaçu</span><i /><span>Sob encomenda</span></div>
      </div>
      <div className="hero-image-wrap">
        <img src={photos.hero} alt="Bolo artesanal floral em uma celebração elegante" />
        <div className="hero-stamp"><small>Criado especialmente</small><strong>para você</strong></div>
      </div>
      <div className="scroll-cue"><span>DESCUBRA</span><i /></div>
    </section>
  );
}

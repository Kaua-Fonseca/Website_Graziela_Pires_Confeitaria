import type { GoFn } from "@/lib/types";
import { photos } from "@/data/photos";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Title } from "@/components/ui/Title";

export function CompactShowcase({ go }: { go: GoFn }) {
  return (
    <section className="compact-showcase">
      <div className="showcase-image"><img src={photos.floral} alt="Bolo personalizado com flores naturais" /></div>
      <div className="showcase-copy">
        <span className="eyebrow">CRIAÇÕES AUTORAIS</span>
        <Title level={2}>Feito para ser<br /><em>inesquecível.</em></Title>
        <p>Veja inspirações reais e encontre o estilo do seu próximo bolo.</p>
        <div className="button-row">
          <Button variant="light" onClick={() => go("showroom")}>Ver showroom <Icon name="arrow" /></Button>
          <Button variant="ghost" onClick={() => go("orcamento")}><Icon name="whatsapp" /> Pedir orçamento</Button>
        </div>
      </div>
    </section>
  );
}

import type { GoFn } from "@/lib/types";
import { photos } from "@/data/photos";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Title } from "@/components/ui/Title";
import { useSite } from "@/lib/site";

export function CompactShowcase({ go }: { go: GoFn }) {
  const { c, on } = useSite();
  return (
    <section className="compact-showcase">
      <div className="showcase-image"><img src={c("showcase.image") || photos.floral} alt="Bolo personalizado com flores naturais" /></div>
      <div className="showcase-copy">
        <span className="eyebrow">{c("showcase.eyebrow")}</span>
        <Title level={2}>{c("showcase.title1")}<br /><em>{c("showcase.title2")}</em></Title>
        <p>{c("showcase.text")}</p>
        <div className="button-row">
          {on("page.showroom") && <Button variant="light" onClick={() => go("showroom")}>Ver showroom <Icon name="arrow" /></Button>}
          <Button variant="ghost" onClick={() => go("orcamento")}><Icon name="whatsapp" /> Pedir orçamento</Button>
        </div>
      </div>
    </section>
  );
}

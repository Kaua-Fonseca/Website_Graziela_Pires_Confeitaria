import { useState } from "react";
import type { GoFn } from "@/lib/types";
import { photos } from "@/data/photos";
import { sizes, type SizeKey } from "@/data/sizes";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useSite } from "@/lib/site";

export function NakedFeature({ go }: { go: GoFn }) {
  const { products } = useSite();
  const [size, setSize] = useState<SizeKey>("P");
  const naked = products.find((p) => p.categorySlug === "naked-cake");
  return (
    <section className="naked-section">
      <div className="naked-image">
        <img src={photos.dark} alt="Naked cake de chocolate com acabamento artesanal" />
        <span className="vertical-label">CAMADAS DE SABOR</span>
      </div>
      <div className="naked-content">
        <SectionHeader
          eyebrow="ASSINATURA DA CASA"
          title={<>Naked cake,<br /><em>naturalmente irresistível.</em></>}
          text="Três camadas de bolo, duas generosas camadas de recheio e brigadeiro cremoso na cobertura. Envolto em lâmina de acetato para chegar impecável."
        />
        <div className="feature-list">
          <span>03 <small>camadas de bolo</small></span>
          <span>02 <small>camadas de recheio</small></span>
          <span>01 <small>criação exclusiva</small></span>
        </div>
        <div className="selector-label"><strong>Escolha o tamanho</strong><small>Selecione para ver os detalhes</small></div>
        <div className="size-selector">
          {(Object.keys(sizes) as SizeKey[]).map((item) => (
            <Button key={item} variant="ghost" className={size === item ? "selected" : ""} onClick={() => setSize(item)}>{item}</Button>
          ))}
        </div>
        <div className="size-result">
          <span><small>Rendimento</small>{sizes[size].slices}</span>
          <span><small>Diâmetro</small>{sizes[size].diameter}</span>
          <span><small>A partir de</small>{sizes[size].price}</span>
        </div>
        <Button onClick={() => (naked ? go("produto", undefined, naked.slug) : go("orcamento"))}>Personalizar meu Naked Cake <Icon name="arrow" size={18} /></Button>
        <p className="fine-print">* Valores base. O orçamento final varia conforme sabores e decoração.</p>
      </div>
    </section>
  );
}

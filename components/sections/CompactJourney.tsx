import type { GoFn } from "@/lib/types";
import { steps } from "@/data/steps";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Title } from "@/components/ui/Title";

export function CompactJourney({ go }: { go: GoFn }) {
  return (
    <section id="processo" className="compact-journey">
      <div className="compact-journey-copy" id="sobre">
        <span className="eyebrow">SIMPLES E PERSONALIZADO</span>
        <Title level={2}>Da sua ideia<br /><em>à celebração.</em></Title>
        <p>Você conta o que imagina. Nós cuidamos dos sabores, do acabamento e de cada detalhe.</p>
        <Button onClick={() => go("orcamento")}>Começar pedido <Icon name="arrow" size={18} /></Button>
      </div>
      <div className="compact-steps">
        {steps.slice(0, 3).map(([title, text], index) => (
          <article key={title}>
            <span>0{index + 1}</span>
            <div><Title level={3}>{title}</Title><p>{text}</p></div>
          </article>
        ))}
      </div>
    </section>
  );
}

import type { GoFn } from "@/lib/types";
import { steps } from "@/data/steps";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Title } from "@/components/ui/Title";
import { useSite } from "@/lib/site";

export function CompactJourney({ go }: { go: GoFn }) {
  const { c, on } = useSite();
  return (
    <section id={on("about") ? undefined : "processo"} className="compact-journey">
      <div className="compact-journey-copy">
        <span className="eyebrow">{c("journey.eyebrow")}</span>
        <Title level={2}>{c("journey.title1")}<br /><em>{c("journey.title2")}</em></Title>
        <p>{c("journey.text")}</p>
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

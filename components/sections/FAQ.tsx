import { useState } from "react";
import { faqs } from "@/data/faqs";
import { Icon } from "@/components/ui/Icon";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section className="section faq">
      <SectionHeader
        eyebrow="PERGUNTAS FREQUENTES"
        title={<>Antes de fazer<br /><em>seu pedido.</em></>}
        text="Reunimos as principais informações para tornar sua escolha mais simples."
      />
      <div className="accordion">
        {faqs.map(([question, answer], index) => (
          <article className={open === index ? "open" : ""} key={question}>
            <button onClick={() => setOpen(open === index ? -1 : index)}>
              <span>{question}</span>
              <Icon name={open === index ? "minus" : "plus"} />
            </button>
            <div className="answer"><p>{answer}</p></div>
          </article>
        ))}
      </div>
    </section>
  );
}

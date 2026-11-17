import { photos } from "@/data/photos";
import { steps } from "@/data/steps";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Title } from "@/components/ui/Title";
import { useSite } from "@/lib/site";

const timeline = ["Início da confeitaria", "Crescimento", "Personalização", "Experiência atual"];

export function AboutProcess() {
  const { c } = useSite();
  const pillars = [["Missão", c("about.mission")], ["Visão", c("about.vision")], ["Valores", c("about.values")], ["Propósito", c("about.purpose")]].filter(([, t]) => t);
  return (
    <>
      <section id="sobre" className="about-section">
        <div className="about-copy">
          <SectionHeader
            eyebrow={c("about.eyebrow")}
            title={<>{c("about.title1")} <em>{c("about.title2")}</em></>}
            text={c("about.history")}
          />
          {pillars.length > 0 && (
            <div className="about-pillars">
              {pillars.map(([t, text]) => <div key={t}><strong>{t}</strong><p>{text}</p></div>)}
            </div>
          )}
          {c("about.quote") && <blockquote>“{c("about.quote")}”</blockquote>}
          {c("about.signature") && <span className="signature">{c("about.signature")}</span>}
        </div>
        <div className="about-image">
          <img src={c("about.image") || photos.baker} alt="Processo artesanal de criação de um bolo" />
          <div className="year-mark"><strong>2019</strong><span>ONDE TUDO COMEÇOU</span></div>
        </div>
        <div className="timeline-mini">
          {timeline.map((item, i) => <div key={item}><span>0{i + 1}</span><p>{item}</p></div>)}
        </div>
      </section>
      <section id="processo" className="section process">
        <SectionHeader align="center" eyebrow="DO SONHO À MESA" title={<>Como funciona</>} text="Um processo simples, próximo e inteiramente personalizado." />
        <div className="steps">
          {steps.map(([title, text], index) => (
            <article key={title}><span>0{index + 1}</span><i /><Title level={3}>{title}</Title><p>{text}</p></article>
          ))}
        </div>
      </section>
    </>
  );
}

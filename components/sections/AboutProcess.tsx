import { photos } from "@/data/photos";
import { steps } from "@/data/steps";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Title } from "@/components/ui/Title";

const timeline = ["Início da confeitaria", "Crescimento", "Personalização", "Experiência atual"];

export function AboutProcess() {
  return (
    <>
      <section id="sobre" className="about-section">
        <div className="about-copy">
          <SectionHeader
            eyebrow="NOSSA HISTÓRIA"
            title={<>Feito para transformar<br />momentos em <em>memórias.</em></>}
            text="Desde 2019, a Graziela Pires Confeitaria une técnica, afeto e olhar artístico para criar bolos e doces personalizados em Foz do Iguaçu."
          />
          <blockquote>“Cada bolo carrega uma história. Nosso trabalho é torná-la ainda mais bonita — e deliciosa.”</blockquote>
          <span className="signature">Graziela Pires</span>
        </div>
        <div className="about-image">
          <img src={photos.baker} alt="Processo artesanal de criação de um bolo" />
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

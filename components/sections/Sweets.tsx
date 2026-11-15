import { useState } from "react";
import { photos } from "@/data/photos";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Title } from "@/components/ui/Title";

const boxSizes = ["24 unidades", "50 unidades"];
const flavors = [
  ["Brigadeiro Tradicional", "Cacau 50% e granulado belga"],
  ["Beijinho", "Coco fresco e leite condensado"],
  ["Ninho", "Leite Ninho e toque de baunilha"],
];

export function Sweets() {
  const [sweetCount, setSweetCount] = useState("24 unidades");
  const [cupCount, setCupCount] = useState(10);
  return (
    <>
      <section id="doces" className="section sweets">
        <SectionHeader
          eyebrow="PEQUENOS PRAZERES"
          title={<>Doces feitos para<br /><em>compartilhar.</em></>}
          text="Receitas clássicas, ingredientes selecionados e o ponto perfeito em cada unidade."
        />
        <div className="sweet-layout">
          <div className="sweet-photo"><img src={photos.brigadeiro} alt="Seleção de brigadeiros artesanais" /></div>
          <div className="sweet-options">
            <div className="option-top">
              <span className="badge">CAIXAS</span>
              <div className="segmented">
                {boxSizes.map((x) => (
                  <Button key={x} variant="ghost" className={sweetCount === x ? "selected" : ""} onClick={() => setSweetCount(x)}>{x}</Button>
                ))}
              </div>
            </div>
            {flavors.map(([name, description], i) => (
              <div className="sweet-row" key={name}>
                <span>0{i + 1}</span>
                <strong>{name}</strong>
                <small>{description}</small>
              </div>
            ))}
            <Button>Solicitar orçamento · {sweetCount} <Icon name="arrow" size={18} /></Button>
          </div>
        </div>
      </section>
      <section id="cupcakes" className="cupcake-band">
        <div>
          <span className="eyebrow">CUPCAKES ARTESANAIS</span>
          <Title level={2}>Pequenos no tamanho.<br /><em>Enormes nos detalhes.</em></Title>
          <p>Grande ou mini, com recheio de brigadeiro ou creme de Ninho e cobertura delicada de buttercream.</p>
          <div className="minimum">PEDIDO MÍNIMO <strong>10 unidades</strong></div>
          <div className="stepper">
            <Button variant="ghost" onClick={() => setCupCount(Math.max(10, cupCount - 5))}><Icon name="minus" /></Button>
            <strong>{cupCount}</strong>
            <Button variant="ghost" onClick={() => setCupCount(cupCount + 5)}><Icon name="plus" /></Button>
            <span>unidades</span>
          </div>
          <Button variant="light">Montar meu pedido <Icon name="arrow" size={18} /></Button>
        </div>
        <img src={photos.cupcake} alt="Cupcake de chocolate com acabamento premium" />
      </section>
    </>
  );
}

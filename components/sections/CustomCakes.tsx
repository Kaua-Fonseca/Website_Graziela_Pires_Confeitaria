import { useState } from "react";
import type { GoFn } from "@/lib/types";
import { photos } from "@/data/photos";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Title } from "@/components/ui/Title";

const gallery = [
  { image: photos.floral, name: "Floral orgânico", text: "Flores naturais, volumes delicados e uma composição criada para o seu evento." },
  { image: photos.pink, name: "Pintura delicada", text: "Pinceladas artesanais e uma paleta desenvolvida a partir da sua referência." },
  { image: photos.white, name: "Minimalismo botânico", text: "Texturas naturais, folhagens e a beleza sofisticada do essencial." },
];

const tags = ["Floral", "Pasta americana", "Pinturas", "Cores", "Glitter", "Sabores"];

export function CustomCakes({ go }: { go: GoFn }) {
  const [modal, setModal] = useState<number | null>(null);
  return (
    <section className="section custom-cakes">
      <div className="custom-heading">
        <SectionHeader
          eyebrow="CRIAÇÕES SOB MEDIDA"
          title={<>Sua ideia,<br /><em>nossa arte.</em></>}
          text="Transformamos referências, ideias e momentos em uma criação verdadeiramente única."
        />
        <div className="tag-cloud">{tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
      </div>
      <div className="editorial-gallery">
        {gallery.map((item, index) => (
          <button className={`gallery-item item-${index + 1}`} key={item.name} onClick={() => setModal(index)}>
            <img src={item.image} alt={item.name} />
            <span>{item.name}<Icon name="plus" /></span>
          </button>
        ))}
      </div>
      <div className="center-action">
        <Button variant="secondary" onClick={() => go("showroom")}>Ver todas as criações <Icon name="arrow" size={18} /></Button>
      </div>
      {modal !== null && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <Button variant="light" className="modal-close" onClick={() => setModal(null)}><Icon name="close" /></Button>
            <img src={gallery[modal].image} alt={gallery[modal].name} />
            <div className="modal-copy">
              <span className="eyebrow">INSPIRAÇÃO</span>
              <Title level={2}>{gallery[modal].name}</Title>
              <p>{gallery[modal].text}</p>
              <Button onClick={() => { setModal(null); go("orcamento"); }}>Quero algo parecido <Icon name="arrow" size={18} /></Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

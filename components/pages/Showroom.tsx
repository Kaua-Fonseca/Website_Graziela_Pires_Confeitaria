import { useState } from "react";
import { photos } from "@/data/photos";
import { products, type Product } from "@/data/products";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { PageHero } from "@/components/ui/PageHero";
import { Title } from "@/components/ui/Title";

const tabs = ["Todos", "Naked", "Personalizados", "Doces", "Cupcakes"];

const items: Product[] = [
  ...products,
  { ...products[0], name: "Chocolate Botânico", image: photos.dark },
  { ...products[4], name: "Mini Cupcakes", image: photos.cupcakes },
];

export function Showroom() {
  const [filter, setFilter] = useState("Todos");
  const [selected, setSelected] = useState<Product | null>(null);
  const shown = filter === "Todos" ? items : items.filter((x) => x.category.includes(filter));
  return (
    <>
      <PageHero eyebrow="NOSSO SHOWROOM" title={<>Uma coleção de<br /><em>momentos doces.</em></>} text="Inspire-se em criações que já fizeram parte de histórias especiais." />
      <main className="showroom">
        <div className="filter-tabs">
          {tabs.map((x) => (
            <Button key={x} variant="ghost" className={filter === x ? "selected" : ""} onClick={() => setFilter(x)}>{x}</Button>
          ))}
        </div>
        <div className="masonry">
          {shown.map((item, index) => (
            <button className={`masonry-item masonry-${index % 4}`} key={`${item.name}-${index}`} onClick={() => setSelected(item)}>
              <img src={item.image} alt={item.name} />
              <span><small>GRAZIELA PIRES · FOZ DO IGUAÇU</small><strong>{item.name}</strong></span>
            </button>
          ))}
        </div>
      </main>
      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <Button variant="light" className="modal-close" onClick={() => setSelected(null)}><Icon name="close" /></Button>
            <img src={selected.image} alt={selected.name} />
            <div className="modal-copy">
              <span className="eyebrow">FEITO POR GRAZIELA PIRES</span>
              <Title>{selected.name}</Title>
              <p>{selected.detail}</p>
              <Button>Quero algo parecido <Icon name="arrow" /></Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

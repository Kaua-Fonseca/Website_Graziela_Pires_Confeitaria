import { useEffect, useState } from "react";
import type { GoFn, Product } from "@/lib/types";
import { photos } from "@/data/photos";
import { useSite } from "@/lib/site";
import { BackButton } from "@/components/ui/BackButton";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { PageHero } from "@/components/ui/PageHero";
import { Title } from "@/components/ui/Title";

export function Showroom({ go }: { go: GoFn }) {
  const { products, categories, setDraft, ready } = useSite();
  const [filter, setFilter] = useState("todos");
  const [selected, setSelected] = useState<Product | null>(null);
  const shown = filter === "todos" ? products : products.filter((x) => x.categorySlug === filter);

  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSelected(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  return (
    <>
      <PageHero eyebrow="NOSSO SHOWROOM" title={<>Uma coleção de<br /><em>momentos doces.</em></>} text="Inspire-se em criações que já fizeram parte de histórias especiais." />
      <main className="showroom">
        <BackButton onFallback={() => go("home")} />
        <div className="filter-tabs">
          <Button variant="ghost" className={filter === "todos" ? "selected" : ""} onClick={() => setFilter("todos")}>Todos</Button>
          {categories.map((cat) => (
            <Button key={cat.slug} variant="ghost" className={filter === cat.slug ? "selected" : ""} onClick={() => setFilter(cat.slug)}>{cat.name}</Button>
          ))}
        </div>
        {!ready ? <div className="empty-state" aria-busy="true"><p>Carregando…</p></div> : (
        <div className="masonry">
          {shown.map((item, index) => (
            <button className={`masonry-item masonry-${index % 4}`} key={item.slug} onClick={() => setSelected(item)}>
              <img src={item.image || photos.white} alt={item.name} loading="lazy" />
              <span><small>GRAZIELA PIRES · FOZ DO IGUAÇU</small><strong>{item.name}</strong></span>
            </button>
          ))}
        </div>
        )}
      </main>
      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal" role="dialog" aria-modal="true" aria-label={selected.name} onClick={(e) => e.stopPropagation()}>
            <Button variant="light" className="modal-close" onClick={() => setSelected(null)} label="Fechar"><Icon name="close" /></Button>
            <img src={selected.image || photos.white} alt={selected.name} />
            <div className="modal-copy">
              <span className="eyebrow">FEITO POR GRAZIELA PIRES</span>
              <Title>{selected.name}</Title>
              <p>{selected.detail}</p>
              <Button onClick={() => { setDraft({ productType: selected.category, idea: `Quero algo parecido com: ${selected.name}` }); setSelected(null); go("orcamento"); }}>Quero algo parecido <Icon name="arrow" /></Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

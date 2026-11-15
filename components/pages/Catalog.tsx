import { useState } from "react";
import type { GoFn } from "@/lib/types";
import { products } from "@/data/products";
import { ProductCard } from "@/components/sections/ProductCard";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { PageHero } from "@/components/ui/PageHero";

const tabs = ["Todos", "Naked Cake", "Bolos Personalizados", "Doces", "Cupcakes"];
const filterLabels = ["Tamanho", "Faixa de preço", "Sabor", "Decoração"];

export function Catalog({ go }: { go: GoFn }) {
  const [category, setCategory] = useState("Todos");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filtered = category === "Todos" ? products : products.filter((p) => p.category === category);
  return (
    <>
      <PageHero
        eyebrow="CATÁLOGO"
        title={<>Criações para<br /><em>cada celebração.</em></>}
        text="Explore sabores, estilos e possibilidades. Tudo pode ser personalizado para o seu momento."
      />
      <main className="catalog-page">
        <div className="filter-tabs">
          {tabs.map((item) => (
            <Button key={item} variant="ghost" className={category === item ? "selected" : ""} onClick={() => setCategory(item)}>{item}</Button>
          ))}
          <Button variant="secondary" onClick={() => setFiltersOpen(!filtersOpen)}>Filtros <Icon name="chevron" /></Button>
        </div>
        {filtersOpen && (
          <div className="filter-panel">
            {filterLabels.map((label) => (
              <label key={label}>
                <span>{label}</span>
                <select defaultValue="">
                  <option value="" disabled>Todos</option>
                  <option>Clássico</option>
                  <option>Personalizado</option>
                </select>
              </label>
            ))}
            <Button>Aplicar filtros</Button>
          </div>
        )}
        <div className="catalog-meta">
          <span>{filtered.length} criações</span>
          <small>Valores iniciais sujeitos à personalização</small>
        </div>
        <div className="product-grid">
          {filtered.map((product) => <ProductCard key={product.name} product={product} go={go} />)}
        </div>
      </main>
    </>
  );
}

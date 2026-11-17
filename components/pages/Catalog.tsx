import { useState } from "react";
import type { GoFn } from "@/lib/types";
import { useSite } from "@/lib/site";
import { ProductCard } from "@/components/sections/ProductCard";
import { BackButton } from "@/components/ui/BackButton";
import { Button } from "@/components/ui/Button";
import { PageHero } from "@/components/ui/PageHero";

export function Catalog({ go, initial }: { go: GoFn; initial?: string }) {
  const { products, categories, ready } = useSite();
  const [category, setCategory] = useState(initial ?? "todos");
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const filtered = products.filter(
    (p) => (category === "todos" || p.categorySlug === category) && (!q || `${p.name} ${p.detail}`.toLowerCase().includes(q)),
  );
  return (
    <>
      <PageHero
        eyebrow="CATÁLOGO"
        title={<>Criações para<br /><em>cada celebração.</em></>}
        text="Explore sabores, estilos e possibilidades. Tudo pode ser personalizado para o seu momento."
      />
      <main className="catalog-page">
        <BackButton onFallback={() => go("home")} />
        <div className="filter-tabs">
          <Button variant="ghost" className={category === "todos" ? "selected" : ""} onClick={() => setCategory("todos")}>Todos</Button>
          {categories.map((cat) => (
            <Button key={cat.slug} variant="ghost" className={category === cat.slug ? "selected" : ""} onClick={() => setCategory(cat.slug)}>{cat.name}</Button>
          ))}
        </div>
        <label className="catalog-search">
          <span className="sr-only">Buscar produto</span>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nome ou descrição" />
        </label>
        <div className="catalog-meta">
          <span>{filtered.length} {filtered.length === 1 ? "criação" : "criações"}</span>
          <small>Valores iniciais sujeitos à personalização</small>
        </div>
        {filtered.length === 0 && ready ? (
          <div className="empty-state">
            <p>Nenhuma criação encontrada.</p>
            <Button variant="secondary" onClick={() => { setCategory("todos"); setQuery(""); }}>Limpar filtros</Button>
          </div>
        ) : (
          <div className="product-grid">
            {filtered.map((product) => <ProductCard key={product.slug} product={product} go={go} />)}
          </div>
        )}
      </main>
    </>
  );
}

import { useState } from "react";
import type { GoFn } from "@/lib/types";
import { photos } from "@/data/photos";
import { sizes, type SizeKey } from "@/data/sizes";
import { useSite } from "@/lib/site";
import { BackButton } from "@/components/ui/BackButton";
import { Button } from "@/components/ui/Button";
import { ChoiceGroup } from "@/components/ui/ChoiceGroup";
import { Icon } from "@/components/ui/Icon";
import { Title } from "@/components/ui/Title";

const CUSTOMIZABLE = ["naked-cake", "bolos-personalizados"];

export function ProductDetail({ go, slug }: { go: GoFn; slug?: string }) {
  const { products, ready, setDraft } = useSite();
  const product = products.find((p) => p.slug === slug);
  const [size, setSize] = useState<SizeKey>("P");
  const [dough, setDough] = useState("Chocolate");
  const [filling, setFilling] = useState("Brigadeiro");
  const [decor, setDecor] = useState("Frutas frescas");

  if (!product) {
    return (
      <main className="detail-page">
        <BackButton onFallback={() => go("catalogo")} />
        <div className="empty-state">
          <Title level={2}>{ready ? "Produto não encontrado" : "Carregando…"}</Title>
          {ready && <Button onClick={() => go("catalogo")}>Ver catálogo</Button>}
        </div>
      </main>
    );
  }

  const customizable = CUSTOMIZABLE.includes(product.categorySlug);
  const request = () => {
    const lines = customizable
      ? [`Produto: ${product.name}`, `Tamanho: ${size} (${sizes[size].slices})`, `Massa: ${dough}`, `Recheio: ${filling}`, `Decoração: ${decor}`]
      : [`Produto: ${product.name}`];
    setDraft({ productType: product.category, idea: lines.join("\n") });
    go("orcamento");
  };

  return (
    <main className="detail-page">
      <BackButton onFallback={() => go("catalogo")} label="Voltar ao catálogo" />
      <div className="breadcrumbs">CATÁLOGO{product.category ? ` / ${product.category.toUpperCase()}` : ""} / <strong>{product.name.toUpperCase()}</strong></div>
      <div className="detail-grid">
        <div className="detail-gallery">
          <img className="detail-main" src={product.image || photos.white} alt={product.name} />
        </div>
        <div className="detail-config">
          {product.category && <span className="badge">{product.category.toUpperCase()}</span>}
          <Title level={1}>{product.name}</Title>
          <p className="lead">{product.detail}</p>
          {customizable && (
            <>
              <ChoiceGroup label="1. Tamanho" options={Object.keys(sizes)} value={size} setValue={(v) => setSize(v as SizeKey)} />
              <ChoiceGroup label="2. Massa" options={["Baunilha", "Chocolate", "Red Velvet"]} value={dough} setValue={setDough} />
              <ChoiceGroup label="3. Recheio" options={["Brigadeiro", "Ninho", "Doce de leite"]} value={filling} setValue={setFilling} />
              <ChoiceGroup label="4. Decoração" options={["Frutas frescas", "Doces", "Flores"]} value={decor} setValue={setDecor} />
            </>
          )}
        </div>
        <aside className="order-summary">
          <span className="eyebrow">RESUMO</span>
          <Title level={2}>{customizable ? "Seu bolo" : "Seu pedido"}</Title>
          {(customizable
            ? [["Tamanho", `${size} · ${sizes[size].slices}`], ["Massa", dough], ["Recheio", filling], ["Decoração", decor]]
            : [["Produto", product.name]]
          ).map(([a, b]) => (
            <div className="summary-row" key={a}><span>{a}</span><strong>{b}</strong></div>
          ))}
          <div className="estimate">
            <span>Valor</span>
            <strong>{product.price}</strong>
            <small>Confirmado no orçamento, conforme tamanho e decoração.</small>
          </div>
          <Button onClick={request}><Icon name="arrow" /> Solicitar orçamento</Button>
          <p>Sem pagamento agora. Finalizamos todos os detalhes pessoalmente.</p>
        </aside>
      </div>
      <div className="detail-note">
        <strong>O que você precisa saber</strong>
        <p>Produção artesanal sob encomenda · Conservar refrigerado · Retirar da geladeira 30 minutos antes de servir · Decorações podem alterar o valor final.</p>
      </div>
    </main>
  );
}

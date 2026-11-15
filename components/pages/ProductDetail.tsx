import { useState } from "react";
import type { GoFn } from "@/lib/types";
import { photos } from "@/data/photos";
import { sizes, type SizeKey } from "@/data/sizes";
import { Button } from "@/components/ui/Button";
import { ChoiceGroup } from "@/components/ui/ChoiceGroup";
import { Icon } from "@/components/ui/Icon";
import { Title } from "@/components/ui/Title";

const detailImages = [photos.chocolate, photos.dark, photos.birthday];

export function ProductDetail({ go }: { go: GoFn }) {
  const [size, setSize] = useState("P");
  const [dough, setDough] = useState("Chocolate");
  const [filling, setFilling] = useState("Brigadeiro");
  const [decor, setDecor] = useState("Frutas frescas");
  const [mainImage, setMainImage] = useState(photos.chocolate);
  const price = size === "PP" ? 165 : size === "P" ? 220 : size === "M" ? 295 : 390;
  return (
    <main className="detail-page">
      <div className="breadcrumbs">CATÁLOGO / NAKED CAKE / <strong>NAKED CLÁSSICO</strong></div>
      <div className="detail-grid">
        <div className="detail-gallery">
          <img className="detail-main" src={mainImage} alt="Naked Cake Clássico" />
          <div>
            {detailImages.map((image) => (
              <button key={image} onClick={() => setMainImage(image)} className={mainImage === image ? "selected" : ""}>
                <img src={image} alt="Variação do naked cake" />
              </button>
            ))}
          </div>
        </div>
        <div className="detail-config">
          <span className="badge">NAKED CAKE</span>
          <Title level={1}>Naked Clássico</Title>
          <p className="lead">Camadas macias, recheio cremoso e finalização artesanal. Uma base elegante para você personalizar.</p>
          <ChoiceGroup label="1. Tamanho" options={["PP", "P", "M", "G"]} value={size} setValue={setSize} />
          <ChoiceGroup label="2. Massa" options={["Baunilha", "Chocolate", "Red Velvet"]} value={dough} setValue={setDough} />
          <ChoiceGroup label="3. Recheio" options={["Brigadeiro", "Ninho", "Doce de leite"]} value={filling} setValue={setFilling} />
          <ChoiceGroup label="4. Decoração" options={["Frutas frescas", "Doces", "Flores"]} value={decor} setValue={setDecor} />
        </div>
        <aside className="order-summary">
          <span className="eyebrow">RESUMO</span>
          <Title level={2}>Seu bolo</Title>
          {[
            ["Tamanho", `${size} · ${sizes[size as SizeKey].slices}`],
            ["Massa", dough],
            ["Recheio", filling],
            ["Decoração", decor],
          ].map(([a, b]) => (
            <div className="summary-row" key={a}><span>{a}</span><strong>{b}</strong></div>
          ))}
          <div className="estimate">
            <span>Valor estimado</span>
            <strong>R$ {price},00</strong>
            <small>Preço base, sujeito à confirmação.</small>
          </div>
          <Button onClick={() => go("orcamento")}><Icon name="whatsapp" /> Solicitar pelo WhatsApp</Button>
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

import type { GoFn } from "@/lib/types";
import { photos } from "@/data/photos";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Link } from "@/components/ui/Link";
import { Title } from "@/components/ui/Title";

const images = [photos.floral, photos.chocolate, photos.cupcake, photos.white, photos.brigadeiro];

export function Instagram({ go }: { go: GoFn }) {
  return (
    <section className="instagram-section">
      <div className="instagram-head">
        <div>
          <span className="eyebrow">ACOMPANHE NOSSO DIA A DIA</span>
          <Title level={2}>Mais criações no Instagram</Title>
        </div>
        <Button variant="secondary"><Icon name="instagram" /> @grazielapiresconfeitaria</Button>
      </div>
      <div className="insta-grid">
        {images.map((image, i) => (
          <Link key={image} className={`insta-${i + 1}`}>
            <img src={image} alt={`Criação artesanal ${i + 1}`} />
            <span><Icon name="instagram" /> Ver publicação</span>
          </Link>
        ))}
      </div>
      <div className="final-cta">
        <span className="eyebrow">SUA IDEIA COMEÇA AQUI</span>
        <Title level={2}>Vamos criar algo especial<br />para o seu momento?</Title>
        <p>Conte como você imagina seu bolo e vamos transformar sua ideia em uma criação única.</p>
        <div className="button-row">
          <Button variant="light" onClick={() => go("orcamento")}>Solicitar orçamento <Icon name="arrow" /></Button>
          <Button variant="ghost" onClick={() => go("orcamento")}><Icon name="whatsapp" /> Falar pelo WhatsApp</Button>
        </div>
      </div>
    </section>
  );
}

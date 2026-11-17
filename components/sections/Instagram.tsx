import type { GoFn } from "@/lib/types";
import { photos } from "@/data/photos";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Title } from "@/components/ui/Title";
import { useSite } from "@/lib/site";
import { waUrl } from "@/lib/client";

const images = [photos.floral, photos.chocolate, photos.cupcake, photos.white, photos.brigadeiro];

export function Instagram({ go }: { go: GoFn }) {
  const { c } = useSite();
  const insta = c("social.instagram_url");
  const wa = c("contact.whatsapp") ? waUrl(c("contact.whatsapp"), "Olá! Gostaria de fazer um orçamento.") : "";
  return (
    <section className="instagram-section">
      <div className="instagram-head">
        <div>
          <span className="eyebrow">ACOMPANHE NOSSO DIA A DIA</span>
          <Title level={2}>Mais criações no Instagram</Title>
        </div>
        {insta && <Button variant="secondary" href={insta}><Icon name="instagram" /> {c("social.instagram_handle")}</Button>}
      </div>
      <div className="insta-grid">
        {images.map((image, i) => (
          insta
            ? <a key={image} className={`insta-${i + 1}`} href={insta} target="_blank" rel="noopener noreferrer">
                <img src={image} alt={`Criação artesanal ${i + 1}`} loading="lazy" />
                <span><Icon name="instagram" /> Ver no Instagram</span>
              </a>
            : <div key={image} className={`insta-${i + 1}`}><img src={image} alt={`Criação artesanal ${i + 1}`} loading="lazy" /></div>
        ))}
      </div>
      <div className="final-cta">
        <span className="eyebrow">SUA IDEIA COMEÇA AQUI</span>
        <Title level={2}>Vamos criar algo especial<br />para o seu momento?</Title>
        <p>Conte como você imagina seu bolo e vamos transformar sua ideia em uma criação única.</p>
        <div className="button-row">
          <Button variant="light" onClick={() => go("orcamento")}>Solicitar orçamento <Icon name="arrow" /></Button>
          {wa && <Button variant="ghost" href={wa}><Icon name="whatsapp" /> Falar pelo WhatsApp</Button>}
        </div>
      </div>
    </section>
  );
}

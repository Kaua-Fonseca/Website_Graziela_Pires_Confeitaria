import type { GoFn } from "@/lib/types";
import { categories } from "@/data/categories";
import { Icon } from "@/components/ui/Icon";
import { Link } from "@/components/ui/Link";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Title } from "@/components/ui/Title";

export function Categories({ go }: { go: GoFn }) {
  return (
    <section className="section categories">
      <SectionHeader align="center" eyebrow="ESCOLHA POR CATEGORIA" title={<>O que você deseja <em>celebrar?</em></>} />
      <div className="category-grid">
        {categories.map(([name, description, image], index) => (
          <article className={`category-card category-${index + 1}`} key={name}>
            <img src={image} alt={name} />
            <div className="category-overlay">
              <span>0{index + 1}</span>
              <Title level={3}>{name}</Title>
              <p>{description}</p>
              <Link onClick={() => go("catalogo")} className="text-link">Conhecer <Icon name="arrow" size={18} /></Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

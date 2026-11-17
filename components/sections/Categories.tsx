import type { GoFn } from "@/lib/types";
import { photos } from "@/data/photos";
import { useSite } from "@/lib/site";
import { Icon } from "@/components/ui/Icon";
import { Link } from "@/components/ui/Link";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Title } from "@/components/ui/Title";

export function Categories({ go }: { go: GoFn }) {
  const { categories, on } = useSite();
  if (!categories.length) return null;
  return (
    <section className="section categories">
      <SectionHeader align="center" eyebrow="ESCOLHA POR CATEGORIA" title={<>O que você deseja <em>celebrar?</em></>} />
      <div className="category-grid">
        {categories.slice(0, 4).map((cat, index) => (
          <article className={`category-card category-${index + 1}`} key={cat.slug}>
            <img src={cat.image || photos.white} alt={cat.name} loading="lazy" />
            <div className="category-overlay">
              <span>0{index + 1}</span>
              <Title level={3}>{cat.name}</Title>
              <p>{cat.description}</p>
              {on("page.catalog") && <Link onClick={() => go("catalogo", undefined, cat.slug)} className="text-link">Conhecer <Icon name="arrow" size={18} /></Link>}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

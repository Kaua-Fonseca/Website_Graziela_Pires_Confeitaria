import type { GoFn } from "@/lib/types";
import type { Product } from "@/data/products";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Title } from "@/components/ui/Title";

export function ProductCard({ product, go }: { product: Product; go: GoFn }) {
  return (
    <article className="product-card">
      <div className="product-image">
        <img src={product.image} alt={product.name} />
        <span className="badge">{product.category}</span>
      </div>
      <div className="product-info">
        <Title level={3}>{product.name}</Title>
        <p>{product.detail}</p>
        <div>
          <strong>{product.price}</strong>
          <Button variant="ghost" onClick={() => go("produto")}>Ver detalhes <Icon name="arrow" size={17} /></Button>
        </div>
      </div>
    </article>
  );
}

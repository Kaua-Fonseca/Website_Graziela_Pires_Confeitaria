import { photos } from "./photos";
import { slugify } from "@/lib/slug";
import type { Product } from "@/lib/types";

const base = [
  { name: "Naked Clássico", category: "Naked Cake", image: photos.chocolate, price: "A partir de R$ 165", detail: "Massa de chocolate, brigadeiro cremoso e finalização artesanal." },
  { name: "Jardim Botânico", category: "Bolos Personalizados", image: photos.floral, price: "A partir de R$ 320", detail: "Flores naturais e acabamento de textura suave." },
  { name: "Branco & Oliva", category: "Bolos Personalizados", image: photos.white, price: "Sob consulta", detail: "Minimalista, elegante e criado para celebrações especiais." },
  { name: "Caixa Celebração", category: "Doces", image: photos.brigadeiro, price: "A partir de R$ 78", detail: "24 doces artesanais em sabores clássicos." },
  { name: "Cupcake Cacau", category: "Cupcakes", image: photos.cupcake, price: "A partir de R$ 9/un.", detail: "Chocolate intenso, recheio cremoso e buttercream." },
  { name: "Romance Floral", category: "Bolos Personalizados", image: photos.pink, price: "A partir de R$ 290", detail: "Pintura delicada, flores e composição personalizada." },
];

// Dados de reserva: usados quando a API não está disponível (ex.: versão estática no GitHub Pages).
export const products: Product[] = base.map((p) => ({ ...p, slug: slugify(p.name), categorySlug: slugify(p.category) }));

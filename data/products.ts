import { photos } from "./photos";

export const products = [
  { name: "Naked Clássico", category: "Naked Cake", image: photos.chocolate, price: "A partir de R$ 165", detail: "Massa de chocolate, brigadeiro cremoso e finalização artesanal." },
  { name: "Jardim Botânico", category: "Bolos Personalizados", image: photos.floral, price: "A partir de R$ 320", detail: "Flores naturais e acabamento de textura suave." },
  { name: "Branco & Oliva", category: "Bolos Personalizados", image: photos.white, price: "Sob consulta", detail: "Minimalista, elegante e criado para celebrações especiais." },
  { name: "Caixa Celebração", category: "Doces", image: photos.brigadeiro, price: "A partir de R$ 78", detail: "24 doces artesanais em sabores clássicos." },
  { name: "Cupcake Cacau", category: "Cupcakes", image: photos.cupcake, price: "A partir de R$ 9/un.", detail: "Chocolate intenso, recheio cremoso e buttercream." },
  { name: "Romance Floral", category: "Bolos Personalizados", image: photos.pink, price: "A partir de R$ 290", detail: "Pintura delicada, flores e composição personalizada." },
];

export type Product = (typeof products)[number];

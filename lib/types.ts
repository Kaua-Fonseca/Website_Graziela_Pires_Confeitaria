export type View =
  | "home" | "catalogo" | "produto" | "showroom" | "orcamento"
  | "entrar" | "cadastro" | "conta" | "esqueci" | "redefinir";

/** go(tela, âncora da home, parâmetro: slug do produto/categoria) */
export type GoFn = (view: View, anchor?: string, param?: string) => void;

export type Product = {
  id?: number;
  slug: string;
  name: string;
  category: string;
  categorySlug: string;
  image: string;
  price: string;
  detail: string;
};

export type Category = { slug: string; name: string; description: string; image: string };

export type User = { id: string; name: string; email: string; phone: string | null; role: "ADMIN" | "CLIENT" };

export type IconName =
  | "arrow"
  | "chevron"
  | "close"
  | "instagram"
  | "menu"
  | "minus"
  | "plus"
  | "upload"
  | "whatsapp";

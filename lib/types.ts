export type View = "home" | "catalogo" | "produto" | "showroom" | "orcamento";

export type GoFn = (view: View, anchor?: string) => void;

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

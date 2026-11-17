import type { View } from "./types";

export type Route = { view: View; param?: string; anchor?: string; token?: string };

const VIEWS: View[] = ["catalogo", "produto", "showroom", "orcamento", "entrar", "cadastro", "conta", "esqueci", "redefinir"];
const ANCHORS = ["processo", "sobre", "doces", "cupcakes"];

/** Rotas por hash (#/catalogo, #/produto/slug): funcionam no botão voltar e na versão estática. */
export function parseHash(hash: string): Route {
  const [path, qs = ""] = hash.replace(/^#\/?/, "").split("?");
  const parts = path.split("/").filter(Boolean);
  const first = parts[0] ?? "";
  if (ANCHORS.includes(first)) return { view: "home", anchor: first };
  if ((VIEWS as string[]).includes(first)) {
    return { view: first as View, param: parts[1] ? decodeURIComponent(parts[1]) : undefined, token: new URLSearchParams(qs).get("token") ?? undefined };
  }
  return { view: "home" };
}

export function toHash(view: View, anchor?: string, param?: string): string {
  if (view === "home") return anchor ? `#/${anchor}` : "#/";
  return `#/${view}${param ? `/${encodeURIComponent(param)}` : ""}`;
}

// Pilha de navegação interna: o "Voltar" só usa o histórico do navegador se a
// página anterior for deste site (quem chegou por link direto vai para a tela de reserva).
const stack: string[] = [];
export function trackNav(hash: string) {
  const h = hash || "#/";
  if (stack.length === 0) stack.push(h);
  else if (stack[stack.length - 1] === h) return;
  else if (stack[stack.length - 2] === h) stack.pop();
  else stack.push(h);
}
export const canGoBack = () => stack.length > 1;

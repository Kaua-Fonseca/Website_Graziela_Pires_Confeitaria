// Chamadas da API pelo site público. Lança Error com a mensagem do servidor.
export async function call<T = any>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(path, {
    method,
    credentials: "same-origin",
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let data: any = null;
  try { data = await res.json(); } catch {}
  if (!res.ok) throw new Error(data?.error ?? "Não foi possível concluir. Tente novamente.");
  return data as T;
}

export const waUrl = (num: string, text?: string) => {
  const d = num.replace(/\D/g, "");
  return d.length < 10 ? "" : `https://wa.me/${d.length <= 11 ? "55" + d : d}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
};

export type QuoteInfo = { id?: number; name: string; whatsapp: string; date?: string; type?: string; idea?: string };

/** Mensagem pronta do orçamento (formatação do WhatsApp: *negrito*). */
export function buildQuoteMessage(q: QuoteInfo): string {
  const lines = [
    "Olá! Gostaria de solicitar um orçamento pelo site.",
    "",
    q.id ? `*Orçamento nº ${q.id}*` : "*Orçamento*",
    `*Nome:* ${q.name}`,
    `*WhatsApp:* ${q.whatsapp}`,
  ];
  if (q.type) lines.push(`*Produto:* ${q.type}`);
  if (q.date) lines.push(`*Data desejada:* ${q.date.split("-").reverse().join("/")}`);
  if (q.idea?.trim()) lines.push("*Detalhes:*", q.idea.trim());
  return lines.join("\n");
}

/** (45) 99999-1234 enquanto digita */
export function maskPhone(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

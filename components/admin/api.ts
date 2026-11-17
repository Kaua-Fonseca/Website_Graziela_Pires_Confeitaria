// Cliente fetch do painel: lança Error com a mensagem do servidor; 401 recarrega (cai na tela de login).
export async function api<T = any>(method: string, path: string, body?: unknown): Promise<T> {
  const isForm = typeof FormData !== "undefined" && body instanceof FormData;
  const res = await fetch(path, {
    method,
    credentials: "same-origin",
    headers: body !== undefined && !isForm ? { "Content-Type": "application/json" } : undefined,
    body: body === undefined ? undefined : isForm ? (body as FormData) : JSON.stringify(body),
  });
  let data: any = null;
  try { data = await res.json(); } catch {}
  if (res.status === 401) {
    if (typeof window !== "undefined") window.location.reload();
    throw new Error("Sessão expirada");
  }
  if (!res.ok) throw new Error(data?.error ?? `Erro ${res.status}`);
  return data as T;
}

export const MAX_UPLOAD = 5 * 1024 * 1024;
export const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

/** Validação rápida no navegador; o servidor valida de novo (assinatura do arquivo e tamanho). */
export function checkFile(f: File): string | null {
  if (!ALLOWED.includes(f.type)) return "Formato não permitido. Envie JPG, PNG ou WebP.";
  if (f.size > MAX_UPLOAD) return "Arquivo maior que 5 MB.";
  return null;
}

export type MediaItem = { id: number; name: string; mime: string; size: number; alt: string; url: string; createdAt: string };

export function uploadMedia(file: File, replaceId?: number): Promise<MediaItem> {
  const f = new FormData();
  f.append("file", file);
  return api<MediaItem>("POST", replaceId ? `/api/admin/media/${replaceId}` : "/api/admin/media", f);
}

export const fmtDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "—";
export const fmtDay = (d?: string | null) => (d ? d.split("-").reverse().join("/") : "—");
export const waLink = (num: string) => {
  const d = num.replace(/\D/g, "");
  if (d.length < 10) return null;
  return `https://wa.me/${d.length <= 11 ? "55" + d : d}`;
};

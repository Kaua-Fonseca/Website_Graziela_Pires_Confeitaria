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

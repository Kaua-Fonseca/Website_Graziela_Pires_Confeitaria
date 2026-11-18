import { env } from "cloudflare:workers";
import { randomUUID } from "node:crypto";

export const MAX_BYTES = 5 * 1024 * 1024;

type ImageType = { mime: "image/jpeg" | "image/png" | "image/webp"; ext: "jpg" | "png" | "webp" };

export function detectImage(buf: Buffer): ImageType | null {
  if (buf.length > 12 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { mime: "image/jpeg", ext: "jpg" };
  if (buf.length > 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return { mime: "image/png", ext: "png" };
  if (buf.length > 12 && buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP") return { mime: "image/webp", ext: "webp" };
  return null;
}

export async function saveFile(buf: Buffer, ext: string): Promise<string> {
  if (!["jpg", "png", "webp"].includes(ext)) throw new Error("Formato de imagem inválido");
  const key = `${randomUUID().replace(/-/g, "")}.${ext}`;
  const contentType = ext === "jpg" ? "image/jpeg" : ext === "png" ? "image/png" : "image/webp";
  await env.MEDIA.put(key, buf, { httpMetadata: { contentType } });
  return key;
}

const safeKey = (key: string) => /^[a-f0-9]{32}\.(jpg|png|webp)$/.test(key);

export async function readStored(key: string): Promise<Buffer | null> {
  if (!safeKey(key)) return null;
  const object = await env.MEDIA.get(key);
  return object ? Buffer.from(await object.arrayBuffer()) : null;
}

export async function removeStored(key: string): Promise<void> {
  if (safeKey(key)) await env.MEDIA.delete(key);
}

export async function readUpload(req: Request): Promise<{ buf: Buffer; mime: string; ext: string; name: string } | { error: string }> {
  const len = Number(req.headers.get("content-length") ?? 0);
  if (len > MAX_BYTES + 64 * 1024) return { error: "Arquivo maior que 5 MB" };
  let form: FormData;
  try { form = await req.formData(); } catch { return { error: "Envio inválido" }; }
  const file = form.get("file");
  if (!(file instanceof File)) return { error: "Selecione um arquivo" };
  if (file.size === 0) return { error: "Arquivo vazio" };
  if (file.size > MAX_BYTES) return { error: "Arquivo maior que 5 MB" };
  const buf = Buffer.from(await file.arrayBuffer());
  const type = detectImage(buf);
  if (!type) return { error: "Formato não permitido. Envie JPG, PNG ou WebP." };
  return { buf, ...type, name: file.name.slice(0, 200) };
}

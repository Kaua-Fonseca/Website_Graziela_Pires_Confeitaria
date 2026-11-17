import { randomBytes } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

export const MAX_BYTES = 5 * 1024 * 1024;
export const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR ?? "uploads");

// Tipo detectado pelos primeiros bytes do arquivo (assinatura), nunca pelo nome ou pelo Content-Type enviado.
// SVG e GIF ficam de fora de propósito: SVG pode carregar script.
export function detectImage(buf: Buffer): { mime: string; ext: string } | null {
  if (buf.length > 12 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { mime: "image/jpeg", ext: "jpg" };
  if (buf.length > 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return { mime: "image/png", ext: "png" };
  if (buf.length > 12 && buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP") return { mime: "image/webp", ext: "webp" };
  return null;
}

export async function saveFile(buf: Buffer, ext: string): Promise<string> {
  await mkdir(UPLOAD_DIR, { recursive: true });
  const filename = `${randomBytes(16).toString("hex")}.${ext}`; // nome gerado: sem path traversal
  await writeFile(path.join(UPLOAD_DIR, filename), buf, { flag: "wx" });
  return filename;
}

const safe = (f: string) => /^[a-f0-9]{32}\.(jpg|png|webp)$/.test(f);

export async function readStored(filename: string): Promise<Buffer | null> {
  if (!safe(filename)) return null;
  return readFile(path.join(UPLOAD_DIR, filename)).catch(() => null);
}

export async function removeStored(filename: string) {
  if (safe(filename)) await unlink(path.join(UPLOAD_DIR, filename)).catch(() => {});
}

/** Lê e valida o arquivo "file" de um multipart. */
export async function readUpload(req: Request): Promise<{ buf: Buffer; mime: string; ext: string; name: string } | { error: string }> {
  const len = Number(req.headers.get("content-length") ?? 0);
  if (len > MAX_BYTES + 64 * 1024) return { error: "Arquivo maior que 5 MB" };
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return { error: "Envio inválido" };
  }
  const file = form.get("file");
  if (!(file instanceof File)) return { error: "Selecione um arquivo" };
  if (file.size === 0) return { error: "Arquivo vazio" };
  if (file.size > MAX_BYTES) return { error: "Arquivo maior que 5 MB" };
  const buf = Buffer.from(await file.arrayBuffer());
  const type = detectImage(buf);
  if (!type) return { error: "Formato não permitido. Envie JPG, PNG ou WebP." };
  return { buf, ...type, name: file.name.slice(0, 200) };
}

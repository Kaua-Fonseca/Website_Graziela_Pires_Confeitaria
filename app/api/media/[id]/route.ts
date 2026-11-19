import { db } from "@/lib/server/db";
import { readStored } from "@/lib/server/media";

const MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const rawId = (await params).id;
  if (!/^\d+$/.test(rawId)) return new Response("Não encontrado", { status: 404 });
  const id = Number(rawId);
  if (!Number.isSafeInteger(id) || id <= 0) return new Response("Não encontrado", { status: 404 });

  try {
    const { rows } = await db().query("SELECT filename, mime FROM media WHERE id=$1", [id]);
    if (!rows[0] || !MIME_TYPES.has(rows[0].mime)) return new Response("Não encontrado", { status: 404 });

    const buf = await readStored(rows[0].filename);
    if (!buf) return new Response("Não encontrado", { status: 404 });

    return new Response(new Uint8Array(buf), {
      headers: {
        "Content-Type": rows[0].mime,
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; sandbox",
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("[MEDIA DELIVERY]", error);
    return new Response("Erro ao carregar imagem", { status: 500 });
  }
}

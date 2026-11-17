import { db } from "@/lib/server/db";
import { readStored } from "@/lib/server/media";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) return new Response("Não encontrado", { status: 404 });
  const { rows } = await db().query("SELECT filename, mime FROM media WHERE id=$1", [id]);
  const buf = rows[0] && (await readStored(rows[0].filename));
  if (!buf) return new Response("Não encontrado", { status: 404 });
  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": rows[0].mime,
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox",
      "Cache-Control": "public, max-age=300",
    },
  });
}

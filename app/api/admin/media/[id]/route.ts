import { z } from "zod";
import { withAdmin } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { fail, isResponse, json, parse } from "@/lib/server/http";
import { readUpload, removeStored, saveFile } from "@/lib/server/media";

const COLS = `id, original_name AS "name", mime, size, alt, '/api/media/' || id AS url, created_at AS "createdAt"`;

// Substitui o arquivo mantendo o mesmo id: tudo que usa essa imagem passa a mostrar a nova.
export const POST = withAdmin<{ id: string }>(async (req, { params }) => {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) return fail("ID inválido", 400);
  const { rows: old } = await db().query("SELECT filename FROM media WHERE id=$1", [id]);
  if (!old[0]) return fail("Imagem não encontrada", 404);
  const up = await readUpload(req);
  if ("error" in up) return fail(up.error, 422);
  const filename = await saveFile(up.buf, up.ext);
  const { rows } = await db().query(
    `UPDATE media SET filename=$2, original_name=$3, mime=$4, size=$5, updated_at=now() WHERE id=$1 RETURNING ${COLS}`,
    [id, filename, up.name, up.mime, up.buf.length],
  );
  await removeStored(old[0].filename);
  return json(rows[0]);
});

export const PATCH = withAdmin<{ id: string }>(async (req, { params }) => {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) return fail("ID inválido", 400);
  const b = await parse(req, z.object({ alt: z.string().trim().max(200) }));
  if (isResponse(b)) return b;
  const { rows } = await db().query(`UPDATE media SET alt=$2 WHERE id=$1 RETURNING ${COLS}`, [id, b.alt]);
  return rows[0] ? json(rows[0]) : fail("Imagem não encontrada", 404);
});

export const DELETE = withAdmin<{ id: string }>(async (_req, { params }) => {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) return fail("ID inválido", 400);
  const url = `/api/media/${id}`;
  const { rows: used } = await db().query(
    `SELECT (SELECT count(*) FROM products WHERE image=$1) + (SELECT count(*) FROM categories WHERE image=$1)
          + (SELECT count(*) FROM site_content WHERE value=$1) AS n`,
    [url],
  );
  if (Number(used[0].n) > 0) return fail("Esta imagem está em uso no site. Troque-a antes de excluir.", 409);
  const { rows } = await db().query("DELETE FROM media WHERE id=$1 RETURNING filename", [id]);
  if (!rows[0]) return fail("Imagem não encontrada", 404);
  await removeStored(rows[0].filename);
  return json({ ok: true });
});

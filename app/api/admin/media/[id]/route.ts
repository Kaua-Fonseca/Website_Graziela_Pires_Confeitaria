import { z } from "zod";
import { withAdmin } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { fail, isResponse, json, parse } from "@/lib/server/http";
import { readUpload, removeStored, saveFile } from "@/lib/server/media";

const COLS = `id, original_name AS "name", mime, size, alt, '/api/media/' || id AS url, created_at AS "createdAt"`;
const parseId = (value: string) => {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
};

// Substitui o objeto no R2 e só remove o antigo depois do commit no PostgreSQL.
export const POST = withAdmin<{ id: string }>(async (req, { params }) => {
  const id = parseId((await params).id);
  if (!id) return fail("ID inválido", 400);
  const up = await readUpload(req);
  if ("error" in up) return fail(up.error, 422);

  let newFilename: string | null = null;
  let oldFilename: string | null = null;
  const client = await db().connect();
  try {
    newFilename = await saveFile(up.buf, up.ext);
    await client.query("BEGIN");
    const old = await client.query("SELECT filename FROM media WHERE id=$1 FOR UPDATE", [id]);
    if (!old.rows[0]) {
      await client.query("ROLLBACK");
      await removeStored(newFilename);
      return fail("Imagem não encontrada", 404);
    }
    oldFilename = old.rows[0].filename;
    const { rows } = await client.query(
      `UPDATE media SET filename=$2, original_name=$3, mime=$4, size=$5, updated_at=now()
       WHERE id=$1 RETURNING ${COLS}`,
      [id, newFilename, up.name, up.mime, up.buf.length],
    );
    await client.query("COMMIT");
    if (oldFilename) {
      await removeStored(oldFilename).catch((error) => console.error("[OLD MEDIA CLEANUP]", error));
    }
    return json(rows[0]);
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    if (newFilename) await removeStored(newFilename).catch(() => {});
    console.error("[ADMIN MEDIA REPLACE]", error);
    return fail("Não foi possível substituir a imagem.", 500);
  } finally {
    client.release();
  }
});

export const PATCH = withAdmin<{ id: string }>(async (req, { params }) => {
  const id = parseId((await params).id);
  if (!id) return fail("ID inválido", 400);
  const b = await parse(req, z.object({ alt: z.string().trim().max(200) }).strict());
  if (isResponse(b)) return b;
  const { rows } = await db().query(`UPDATE media SET alt=$2 WHERE id=$1 RETURNING ${COLS}`, [id, b.alt]);
  return rows[0] ? json(rows[0]) : fail("Imagem não encontrada", 404);
});

export const DELETE = withAdmin<{ id: string }>(async (_req, { params }) => {
  const id = parseId((await params).id);
  if (!id) return fail("ID inválido", 400);

  const client = await db().connect();
  let filename: string | null = null;
  try {
    await client.query("BEGIN");
    const media = await client.query("SELECT filename FROM media WHERE id=$1 FOR UPDATE", [id]);
    if (!media.rows[0]) {
      await client.query("ROLLBACK");
      return fail("Imagem não encontrada", 404);
    }

    const url = `/api/media/${id}`;
    const { rows: used } = await client.query(
      `SELECT
        (SELECT count(*) FROM products WHERE image=$1) +
        (SELECT count(*) FROM categories WHERE image=$1) +
        (SELECT count(*) FROM site_content WHERE value=$1) AS n`,
      [url],
    );
    if (Number(used[0].n) > 0) {
      await client.query("ROLLBACK");
      return fail("Esta imagem está em uso no site. Troque-a antes de excluir.", 409);
    }

    filename = media.rows[0].filename;
    await client.query("DELETE FROM media WHERE id=$1", [id]);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("[ADMIN MEDIA DELETE]", error);
    return fail("Não foi possível excluir a imagem.", 500);
  } finally {
    client.release();
  }

  if (filename) await removeStored(filename).catch((error) => console.error("[MEDIA CLEANUP]", error));
  return json({ ok: true });
});

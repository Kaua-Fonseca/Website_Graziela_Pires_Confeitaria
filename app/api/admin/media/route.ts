import { withAdmin } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { fail, json } from "@/lib/server/http";
import { readUpload, removeStored, saveFile } from "@/lib/server/media";

const COLS = `id, original_name AS "name", mime, size, alt, '/api/media/' || id AS url, created_at AS "createdAt"`;

export const GET = withAdmin(async () => {
  const { rows } = await db().query(`SELECT ${COLS} FROM media ORDER BY id DESC LIMIT 500`);
  return json(rows);
});

export const POST = withAdmin(async (req, _ctx, user) => {
  const up = await readUpload(req);
  if ("error" in up) return fail(up.error, 422);

  let filename: string | null = null;
  try {
    filename = await saveFile(up.buf, up.ext);
    const { rows } = await db().query(
      `INSERT INTO media (filename, original_name, mime, size, uploaded_by)
       VALUES ($1,$2,$3,$4,$5) RETURNING ${COLS}`,
      [filename, up.name, up.mime, up.buf.length, user.id],
    );
    return json(rows[0], 201);
  } catch (error) {
    if (filename) await removeStored(filename).catch(() => {});
    console.error("[ADMIN MEDIA UPLOAD]", error);
    return fail("Não foi possível salvar a imagem.", 500);
  }
});

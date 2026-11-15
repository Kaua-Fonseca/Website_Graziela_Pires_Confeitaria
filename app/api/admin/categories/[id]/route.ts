import { withAdmin } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { fail, isResponse, json, parse, slugify } from "@/lib/server/http";
import { categorySchema } from "@/lib/server/schemas";

export const PUT = withAdmin<{ id: string }>(async (req, { params }) => {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) return fail("ID inválido", 400);
  const b = await parse(req, categorySchema);
  if (isResponse(b)) return b;
  try {
    const { rows } = await db().query(
      "UPDATE categories SET slug=$2, name=$3, description=$4, image=$5, position=$6 WHERE id=$1 RETURNING *",
      [id, slugify(b.name), b.name, b.description, b.image, b.position],
    );
    return rows[0] ? json(rows[0]) : fail("Categoria não encontrada", 404);
  } catch (e: any) {
    if (e.code === "23505") return fail("Já existe uma categoria com esse nome", 409);
    throw e;
  }
});

export const DELETE = withAdmin<{ id: string }>(async (_req, { params }) => {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) return fail("ID inválido", 400);
  const { rowCount } = await db().query("DELETE FROM categories WHERE id=$1", [id]);
  return rowCount ? json({ ok: true }) : fail("Categoria não encontrada", 404);
});

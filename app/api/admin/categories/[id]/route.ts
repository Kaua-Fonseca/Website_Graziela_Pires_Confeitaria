import { withAdmin } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { fail, isResponse, json, parse, slugify } from "@/lib/server/http";
import { categorySchema } from "@/lib/server/schemas";

const parseId = (value: string) => {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
};

export const PUT = withAdmin<{ id: string }>(async (req, { params }) => {
  const id = parseId((await params).id);
  if (!id) return fail("ID inválido", 400);
  const body = await parse(req, categorySchema);
  if (isResponse(body)) return body;
  const slug = slugify(body.name);
  if (!slug) return fail("Nome inválido", 422);

  try {
    const { rows } = await db().query(
      "UPDATE categories SET slug=$2, name=$3, description=$4, image=$5, position=$6 WHERE id=$1 RETURNING *",
      [id, slug, body.name, body.description, body.image, body.position],
    );
    return rows[0] ? json(rows[0]) : fail("Categoria não encontrada", 404);
  } catch (error) {
    if ((error as { code?: string }).code === "23505") return fail("Já existe uma categoria com esse nome", 409);
    throw error;
  }
});

export const DELETE = withAdmin<{ id: string }>(async (_req, { params }) => {
  const id = parseId((await params).id);
  if (!id) return fail("ID inválido", 400);

  const client = await db().connect();
  try {
    await client.query("BEGIN");
    const category = await client.query("SELECT id FROM categories WHERE id=$1 FOR UPDATE", [id]);
    if (!category.rows[0]) {
      await client.query("ROLLBACK");
      return fail("Categoria não encontrada", 404);
    }

    const products = await client.query("SELECT 1 FROM products WHERE category_id=$1 LIMIT 1", [id]);
    if (products.rows.length) {
      await client.query("ROLLBACK");
      return fail("Esta categoria possui produtos. Mova ou exclua os produtos antes de removê-la.", 409);
    }

    await client.query("DELETE FROM categories WHERE id=$1", [id]);
    await client.query("COMMIT");
    return json({ ok: true });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("[ADMIN CATEGORY DELETE]", error);
    return fail("Não foi possível excluir a categoria.", 500);
  } finally {
    client.release();
  }
});

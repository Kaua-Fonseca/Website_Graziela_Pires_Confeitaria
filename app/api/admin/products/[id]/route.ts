import { withAdmin } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { fail, isResponse, json, parse } from "@/lib/server/http";
import { productSchema, SELECT } from "@/lib/server/schemas";

// O slug não muda na edição, para não quebrar links já compartilhados.
export const PUT = withAdmin<{ id: string }>(async (req, { params }) => {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) return fail("ID inválido", 400);
  const b = await parse(req, productSchema);
  if (isResponse(b)) return b;
  try {
    const { rowCount } = await db().query(
      `UPDATE products SET name=$2, category_id=$3, image=$4, price_label=$5, detail=$6,
         active=$7, position=$8, updated_at=now() WHERE id=$1`,
      [id, b.name, b.categoryId, b.image, b.price, b.detail, b.active, b.position],
    );
    if (!rowCount) return fail("Produto não encontrado", 404);
  } catch (e: any) {
    if (e.code === "23503") return fail("Categoria inexistente", 422);
    throw e;
  }
  const { rows } = await db().query(`${SELECT} WHERE p.id=$1`, [id]);
  return json(rows[0]);
});

export const DELETE = withAdmin<{ id: string }>(async (_req, { params }) => {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) return fail("ID inválido", 400);
  const { rowCount } = await db().query("DELETE FROM products WHERE id=$1", [id]);
  return rowCount ? json({ ok: true }) : fail("Produto não encontrado", 404);
});

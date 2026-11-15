import { withAdmin } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { fail, isResponse, json, parse, slugify } from "@/lib/server/http";
import { productSchema, SELECT } from "@/lib/server/schemas";

export const GET = withAdmin(async () => {
  const { rows } = await db().query(`${SELECT} ORDER BY p.position, p.id`);
  return json(rows);
});

export const POST = withAdmin(async (req) => {
  const b = await parse(req, productSchema);
  if (isResponse(b)) return b;
  const base = slugify(b.name);
  if (!base) return fail("Nome inválido", 422);
  try {
    // slug único: acrescenta sufixo numérico se já existir
    const { rows: taken } = await db().query("SELECT slug FROM products WHERE slug = $1 OR slug LIKE $2", [base, `${base}-%`]);
    const used = new Set(taken.map((r) => r.slug));
    let slug = base;
    for (let n = 2; used.has(slug); n++) slug = `${base}-${n}`;
    const { rows } = await db().query(
      `INSERT INTO products (slug, name, category_id, image, price_label, detail, active, position)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
      [slug, b.name, b.categoryId, b.image, b.price, b.detail, b.active, b.position],
    );
    const { rows: out } = await db().query(`${SELECT} WHERE p.id=$1`, [rows[0].id]);
    return json(out[0], 201);
  } catch (e: any) {
    if (e.code === "23503") return fail("Categoria inexistente", 422);
    if (e.code === "23505") return fail("Conflito de slug, tente novamente", 409);
    throw e;
  }
});

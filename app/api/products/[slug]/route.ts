import { db } from "@/lib/server/db";
import { fail, json } from "@/lib/server/http";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { rows } = await db().query(
    `SELECT p.id, p.slug, p.name, p.image, p.price_label AS "price", p.detail,
            c.slug AS "categorySlug", c.name AS "category"
     FROM products p LEFT JOIN categories c ON c.id = p.category_id
     WHERE p.active AND p.slug = $1`,
    [slug],
  );
  return rows[0] ? json(rows[0]) : fail("Produto não encontrado", 404);
}

import { db } from "@/lib/server/db";
import { json } from "@/lib/server/http";

export async function GET(req: Request) {
  try {
    const category = new URL(req.url).searchParams.get("category");
    const { rows } = await db().query(
      `SELECT p.id, p.slug, p.name, p.image, p.price_label AS "price", p.detail,
              c.slug AS "categorySlug", c.name AS "category"
       FROM products p LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.active AND ($1::text IS NULL OR c.slug = $1)
       ORDER BY p.position, p.id`,
      [category],
    );
    return json(rows);
  } catch (error) {
    console.error("[PRODUCTS API]", error);
    return json({ error: "Não foi possível carregar os produtos." }, 500);
  }
}

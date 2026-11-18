
import { Client } from "pg";
import { env } from "cloudflare:workers";
import { json } from "@/lib/server/http";

export async function GET(req: Request) {
  const client = new Client({
    connectionString: env.HYPERDRIVE.connectionString,
    connectionTimeoutMillis: 10000,
    query_timeout: 10000,
  });

  try {
    await client.connect();

    const category = new URL(req.url).searchParams.get("category");

    const { rows } = await client.query(
      `SELECT p.id, p.slug, p.name, p.image, p.price_label AS "price", p.detail,
              c.slug AS "categorySlug", c.name AS "category"
       FROM products p LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.active AND ($1::text IS NULL OR c.slug = $1)
       ORDER BY p.position, p.id`,
      [category],
    );

    return json(rows);
  } catch (error) {
    console.error("[HYPERDRIVE TEST]", error);
    return json(
      { error: "Falha na conexão com PostgreSQL" },
      500,
    );
  }
}

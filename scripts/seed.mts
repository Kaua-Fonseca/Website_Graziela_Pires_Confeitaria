import "./env";
import { db } from "../lib/server/db";
import { slugify } from "../lib/server/http";
import { categories } from "../data/categories";
import { products } from "../data/products";

const pool = db();
const catIds = new Map<string, number>();

for (const [i, [name, description, image]] of categories.entries()) {
  const { rows } = await pool.query(
    `INSERT INTO categories (slug, name, description, image, position) VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name RETURNING id`,
    [slugify(name), name, description, image, i],
  );
  catIds.set(slugify(name), rows[0].id);
}

for (const [i, p] of products.entries()) {
  await pool.query(
    `INSERT INTO products (slug, name, category_id, image, price_label, detail, position)
     VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (slug) DO NOTHING`,
    [slugify(p.name), p.name, catIds.get(slugify(p.category)) ?? null, p.image, p.price, p.detail, i],
  );
}
console.log(`Seed ok: ${categories.length} categorias, ${products.length} produtos.`);
await pool.end();

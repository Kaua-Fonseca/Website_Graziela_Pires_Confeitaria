import { withAdmin } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { fail, isResponse, json, parse, slugify } from "@/lib/server/http";
import { categorySchema } from "@/lib/server/schemas";

export const GET = withAdmin(async () => {
  const { rows } = await db().query("SELECT * FROM categories ORDER BY position, id");
  return json(rows);
});

export const POST = withAdmin(async (req) => {
  const b = await parse(req, categorySchema);
  if (isResponse(b)) return b;
  const slug = slugify(b.name);
  if (!slug) return fail("Nome inválido", 422);
  try {
    const { rows } = await db().query(
      "INSERT INTO categories (slug, name, description, image, position) VALUES ($1,$2,$3,$4,$5) RETURNING *",
      [slug, b.name, b.description, b.image, b.position],
    );
    return json(rows[0], 201);
  } catch (e: any) {
    if (e.code === "23505") return fail("Já existe uma categoria com esse nome", 409);
    throw e;
  }
});

import { db } from "@/lib/server/db";
import { json } from "@/lib/server/http";

export async function GET() {
  const { rows } = await db().query(
    "SELECT id, slug, name, description, image FROM categories ORDER BY position, id",
  );
  return json(rows);
}

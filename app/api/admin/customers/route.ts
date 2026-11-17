import { withAdmin } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { json } from "@/lib/server/http";

const COLS = `id, name, email, phone, is_active AS "isActive", created_at AS "createdAt"`;

export const GET = withAdmin(async (req) => {
  const q = new URL(req.url).searchParams.get("q")?.trim().slice(0, 100) ?? "";
  const like = `%${q.replace(/[\\%_]/g, "\\$&")}%`;
  const { rows } = await db().query(
    `SELECT ${COLS} FROM users WHERE role='CLIENT' AND ($1 = '' OR name ILIKE $2 OR email ILIKE $2)
     ORDER BY created_at DESC LIMIT 200`,
    [q, like],
  );
  return json(rows);
});

import { withAdmin } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { json } from "@/lib/server/http";

export const GET = withAdmin(async (req) => {
  const status = new URL(req.url).searchParams.get("status");
  const { rows } = await db().query(
    `SELECT id, name, whatsapp, to_char(desired_date, 'YYYY-MM-DD') AS "desiredDate", product_type AS "productType",
            idea, status, created_at AS "createdAt"
     FROM quotes WHERE ($1::text IS NULL OR status = $1) ORDER BY created_at DESC LIMIT 200`,
    [status],
  );
  return json(rows);
});

import { withAdmin } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { json } from "@/lib/server/http";

export const GET = withAdmin(async () => {
  const q = (sql: string) => db().query(sql).then((r) => r.rows);
  const [[c], quotes, [p], [m]] = await Promise.all([
    q(`SELECT count(*)::int AS total, count(*) FILTER (WHERE is_active)::int AS active,
              count(*) FILTER (WHERE created_at > now() - interval '7 days')::int AS "lastWeek"
       FROM users WHERE role='CLIENT'`),
    q("SELECT status, count(*)::int AS n FROM quotes GROUP BY status"),
    q("SELECT count(*)::int AS total, count(*) FILTER (WHERE active)::int AS active FROM products"),
    q("SELECT count(*)::int AS total FROM media"),
  ]);
  return json({ customers: c, quotes: Object.fromEntries(quotes.map((r) => [r.status, r.n])), products: p, media: m });
});

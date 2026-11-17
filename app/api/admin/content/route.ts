import { z } from "zod";
import { withAdmin } from "@/lib/server/auth";
import { validateField, normalizeField, loadSite } from "@/lib/server/content";
import { db } from "@/lib/server/db";
import { fail, isResponse, json, parse } from "@/lib/server/http";

export const GET = withAdmin(async () => json(await loadSite()));

// Valores vazios voltam ao texto padrão do site.
const schema = z.object({ values: z.record(z.string(), z.string()) });

export const PUT = withAdmin(async (req) => {
  const b = await parse(req, schema);
  if (isResponse(b)) return b;
  for (const [k, v] of Object.entries(b.values)) {
    const err = validateField(k, v);
    if (err) return fail(err, 422);
  }
  for (const k of Object.keys(b.values)) b.values[k] = normalizeField(k, b.values[k]);
  const client = await db().connect();
  try {
    await client.query("BEGIN");
    for (const [k, v] of Object.entries(b.values)) {
      if (v === "") await client.query("DELETE FROM site_content WHERE key=$1", [k]);
      else
        await client.query(
          `INSERT INTO site_content (key, value) VALUES ($1,$2)
           ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=now()`,
          [k, v],
        );
    }
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
  return json(await loadSite());
});

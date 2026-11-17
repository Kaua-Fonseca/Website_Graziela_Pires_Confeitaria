import { z } from "zod";
import { SECTIONS } from "@/lib/content";
import { withAdmin } from "@/lib/server/auth";
import { loadSite } from "@/lib/server/content";
import { db } from "@/lib/server/db";
import { fail, isResponse, json, parse } from "@/lib/server/http";

const schema = z.object({ sections: z.record(z.string(), z.boolean()) });

export const PUT = withAdmin(async (req) => {
  const b = await parse(req, schema);
  if (isResponse(b)) return b;
  const valid = new Set(SECTIONS.map((s) => s.key));
  for (const [k, enabled] of Object.entries(b.sections)) {
    if (!valid.has(k)) return fail(`Seção desconhecida: ${k}`, 422);
    await db().query(
      "INSERT INTO site_sections (key, enabled) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET enabled=EXCLUDED.enabled",
      [k, enabled],
    );
  }
  return json(await loadSite());
});

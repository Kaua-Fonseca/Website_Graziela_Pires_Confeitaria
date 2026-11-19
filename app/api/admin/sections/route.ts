import { z } from "zod";
import { SECTIONS } from "@/lib/content";
import { withAdmin } from "@/lib/server/auth";
import { loadSite } from "@/lib/server/content";
import { db } from "@/lib/server/db";
import { fail, isResponse, json, parse } from "@/lib/server/http";

const validKeys = new Set(SECTIONS.map((section) => section.key));
const schema = z.object({
  sections: z.record(z.string().min(1).max(80), z.boolean()).refine(
    (sections) => Object.keys(sections).length <= SECTIONS.length,
    "Quantidade de seções inválida",
  ),
}).strict();

export const PUT = withAdmin(async (req) => {
  const body = await parse(req, schema);
  if (isResponse(body)) return body;

  for (const key of Object.keys(body.sections)) {
    if (!validKeys.has(key)) return fail(`Seção desconhecida: ${key}`, 422);
  }

  const client = await db().connect();
  try {
    await client.query("BEGIN");
    for (const [key, enabled] of Object.entries(body.sections)) {
      await client.query(
        "INSERT INTO site_sections (key, enabled) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET enabled=EXCLUDED.enabled",
        [key, enabled],
      );
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("[ADMIN SECTIONS UPDATE]", error);
    return fail("Não foi possível atualizar as seções.", 500);
  } finally {
    client.release();
  }

  return json(await loadSite());
});

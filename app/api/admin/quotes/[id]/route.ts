import { z } from "zod";
import { withAdmin } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { fail, isResponse, json, parse } from "@/lib/server/http";

const schema = z.object({ status: z.enum(["novo", "em_contato", "fechado", "descartado"]) });

export const PATCH = withAdmin<{ id: string }>(async (req, { params }) => {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) return fail("ID inválido", 400);
  const b = await parse(req, schema);
  if (isResponse(b)) return b;
  const { rowCount } = await db().query("UPDATE quotes SET status=$2 WHERE id=$1", [id, b.status]);
  return rowCount ? json({ ok: true }) : fail("Orçamento não encontrado", 404);
});

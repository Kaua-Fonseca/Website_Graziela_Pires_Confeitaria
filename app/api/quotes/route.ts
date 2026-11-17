import { z } from "zod";
import { currentUser } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { clientIp, fail, isResponse, json, parse, sameOrigin } from "@/lib/server/http";
import { hit } from "@/lib/server/rate-limit";

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  whatsapp: z.string().trim().regex(/^[\d\s()+-]{8,20}$/, "WhatsApp inválido"),
  desiredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
  productType: z.string().trim().max(60).optional(),
  idea: z.string().trim().max(2000).default(""),
});

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail("Origem não permitida", 403);
  // 5 orçamentos por IP a cada 10 minutos
  if (!(await hit("quote", clientIp(req), 5, 600))) return fail("Muitas solicitações. Tente novamente em instantes.", 429);

  const body = await parse(req, schema);
  if (isResponse(body)) return body;

  const user = await currentUser();
  const { rows } = await db().query(
    `INSERT INTO quotes (name, whatsapp, desired_date, product_type, idea, user_id)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
    [body.name, body.whatsapp, body.desiredDate || null, body.productType || null, body.idea, user?.id ?? null],
  );
  return json({ id: rows[0].id }, 201);
}

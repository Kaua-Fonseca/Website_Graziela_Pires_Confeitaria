import { z } from "zod";
import { withUser } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { isResponse, json, parse } from "@/lib/server/http";
import { phoneSchema } from "@/lib/server/schemas";

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: phoneSchema.nullable().or(z.literal("")).default(null),
});

export const GET = withUser(async (_req, _ctx, user) => json(user));

// Só nome e telefone: e-mail e permissão não são editáveis aqui (a permissão nunca é).
export const PATCH = withUser(async (req, _ctx, user) => {
  const b = await parse(req, schema);
  if (isResponse(b)) return b;
  const { rows } = await db().query(
    "UPDATE users SET name=$2, phone=$3, updated_at=now() WHERE id=$1 RETURNING id, email, name, phone, role",
    [user.id, b.name, b.phone || null],
  );
  return json(rows[0]);
});

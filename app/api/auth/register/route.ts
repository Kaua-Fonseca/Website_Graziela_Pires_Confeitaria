import { z } from "zod";
import { createSession, hashPassword } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { clientIp, fail, isResponse, json, parse, sameOrigin } from "@/lib/server/http";
import { hit } from "@/lib/server/rate-limit";
import { emailSchema, passwordSchema, phoneSchema } from "@/lib/server/schemas";

const schema = z.object({
  name: z.string().trim().min(2, "Informe seu nome").max(120),
  email: emailSchema,
  password: passwordSchema,
  phone: phoneSchema.optional().or(z.literal("")),
});

// A permissão nunca vem do cliente: toda conta criada por aqui é CLIENT.
export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail("Origem não permitida", 403);
  if (!(await hit("register", clientIp(req), 10, 3600))) return fail("Muitas tentativas. Tente mais tarde.", 429);
  const b = await parse(req, schema);
  if (isResponse(b)) return b;
  try {
    const { rows } = await db().query(
      `INSERT INTO users (email, name, phone, password_hash, role) VALUES ($1,$2,$3,$4,'CLIENT')
       RETURNING id, email, name, phone, role`,
      [b.email, b.name, b.phone || null, await hashPassword(b.password)],
    );
    await createSession(rows[0].id);
    return json(rows[0], 201);
  } catch (e) {
    if ((e as { code?: string }).code === "23505") return fail("Já existe uma conta com esse e-mail", 409);
    throw e;
  }
}

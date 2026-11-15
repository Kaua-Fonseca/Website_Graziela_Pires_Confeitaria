import { z } from "zod";
import { createSession, hashPassword, verifyPassword } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { clientIp, fail, isResponse, json, parse, sameOrigin } from "@/lib/server/http";
import { cleanup, exceeded, hit, reset } from "@/lib/server/rate-limit";

const schema = z.object({ email: z.string().trim().toLowerCase().email().max(200), password: z.string().min(1).max(200) });

// hash fictício para gastar o mesmo tempo quando o e-mail não existe
let dummy: Promise<string> | undefined;

const MAX_FAILS = 5;
const WINDOW = 15 * 60;

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail("Origem não permitida", 403);
  const body = await parse(req, schema);
  if (isResponse(body)) return body;

  const key = `${body.email}|${clientIp(req)}`;
  if (await exceeded("login", key, MAX_FAILS, WINDOW)) {
    return fail("Muitas tentativas. Aguarde 15 minutos.", 429);
  }

  const { rows } = await db().query("SELECT id, name, email, password_hash FROM admins WHERE email=$1", [body.email]);
  const admin = rows[0];
  dummy ??= hashPassword("senha-ficticia-para-equalizar-tempo");
  const ok = await verifyPassword(admin?.password_hash ?? (await dummy), body.password);

  if (!admin || !ok) {
    await hit("login", key, MAX_FAILS, WINDOW);
    return fail("E-mail ou senha incorretos", 401);
  }

  await reset("login", key);
  await createSession(admin.id);
  if (Math.random() < 0.05) cleanup().catch(() => {});
  return json({ id: admin.id, name: admin.name, email: admin.email });
}

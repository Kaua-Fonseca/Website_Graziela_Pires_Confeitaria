import { z } from "zod";
import { createSession, hashPassword, verifyPassword } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { clientIp, fail, isResponse, json, parse, sameOrigin } from "@/lib/server/http";
import { cleanup, exceeded, hit, reset } from "@/lib/server/rate-limit";
import { emailSchema } from "@/lib/server/schemas";

const schema = z.object({ email: emailSchema, password: z.string().min(1).max(200) });

// hash fictício: gasta o mesmo tempo quando o e-mail não existe (evita enumerar contas pelo tempo de resposta)
let dummy: Promise<string> | undefined;

const MAX_FAILS = 5;
const WINDOW = 15 * 60;

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail("Origem não permitida", 403);
  const b = await parse(req, schema);
  if (isResponse(b)) return b;

  const key = `${b.email}|${clientIp(req)}`;
  if (await exceeded("login", key, MAX_FAILS, WINDOW)) return fail("Muitas tentativas. Aguarde 15 minutos.", 429);

  const { rows } = await db().query(
    "SELECT id, name, email, phone, role, password_hash, is_active FROM users WHERE lower(email)=$1",
    [b.email],
  );
  const u = rows[0];
  dummy ??= hashPassword("senha-ficticia-para-equalizar-tempo");
  const ok = await verifyPassword(u?.password_hash ?? (await dummy), b.password);

  if (!u || !ok || !u.is_active) {
    await hit("login", key, MAX_FAILS, WINDOW);
    return fail("E-mail ou senha incorretos", 401);
  }
  await reset("login", key);
  await createSession(u.id);
  if (Math.random() < 0.05) cleanup().catch(() => {});
  return json({ id: u.id, name: u.name, email: u.email, phone: u.phone, role: u.role });
}

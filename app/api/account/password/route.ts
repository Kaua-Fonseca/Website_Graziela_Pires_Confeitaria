import { z } from "zod";
import { destroyOtherSessions, hashPassword, verifyPassword, withUser } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { fail, isResponse, json, parse } from "@/lib/server/http";
import { hit } from "@/lib/server/rate-limit";
import { passwordSchema } from "@/lib/server/schemas";

const schema = z.object({ current: z.string().min(1).max(200), password: passwordSchema });

export const PUT = withUser(async (req, _ctx, user) => {
  if (!(await hit("pwchange", user.id, 5, 900))) return fail("Muitas tentativas. Aguarde alguns minutos.", 429);
  const b = await parse(req, schema);
  if (isResponse(b)) return b;
  const { rows } = await db().query("SELECT password_hash FROM users WHERE id=$1", [user.id]);
  if (!(await verifyPassword(rows[0].password_hash, b.current))) return fail("Senha atual incorreta", 403);
  await db().query("UPDATE users SET password_hash=$2, updated_at=now() WHERE id=$1", [user.id, await hashPassword(b.password)]);
  await destroyOtherSessions(user.id); // derruba outros dispositivos, mantém este
  return json({ ok: true });
});

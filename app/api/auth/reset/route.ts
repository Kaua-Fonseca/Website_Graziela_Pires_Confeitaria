import { z } from "zod";
import { hashPassword, sha } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { clientIp, fail, isResponse, json, parse, sameOrigin } from "@/lib/server/http";
import { hit } from "@/lib/server/rate-limit";
import { passwordSchema } from "@/lib/server/schemas";

const schema = z.object({ token: z.string().min(20).max(100), password: passwordSchema });

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail("Origem não permitida", 403);
  if (!(await hit("reset", clientIp(req), 20, 3600))) return fail("Muitas tentativas.", 429);
  const b = await parse(req, schema);
  if (isResponse(b)) return b;

  const pool = db();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    // consumo atômico: só um uso do token é possível
    const { rows } = await client.query(
      `UPDATE password_resets SET used_at = now()
       WHERE token_hash=$1 AND used_at IS NULL AND expires_at > now() RETURNING user_id`,
      [sha(b.token)],
    );
    if (!rows[0]) {
      await client.query("ROLLBACK");
      return fail("Link inválido ou expirado. Peça uma nova redefinição.", 400);
    }
    await client.query("UPDATE users SET password_hash=$2, updated_at=now() WHERE id=$1", [rows[0].user_id, await hashPassword(b.password)]);
    await client.query("DELETE FROM sessions WHERE user_id=$1", [rows[0].user_id]);
    await client.query("COMMIT");
    return json({ ok: true });
  } catch (e) {
    await client.query("ROLLBACK").catch(() => {});
    throw e;
  } finally {
    client.release();
  }
}

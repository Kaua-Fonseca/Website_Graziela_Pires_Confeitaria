import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { hashPassword, verifyPassword } from "./auth-hash";
import { db } from "./db";
import { fail, sameOrigin } from "./http";

export const COOKIE = "gp_session";
const SESSION_DAYS = 7;

export { hashPassword, verifyPassword };

const sha = (t: string) => createHash("sha256").update(t).digest("hex");

export async function createSession(adminId: string) {
  const token = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_DAYS * 86400_000);
  await db().query("INSERT INTO sessions (id, admin_id, expires_at) VALUES ($1,$2,$3)", [sha(token), adminId, expires]);
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await db().query("DELETE FROM sessions WHERE id=$1", [sha(token)]);
  jar.delete(COOKIE);
}

export type Admin = { id: string; email: string; name: string };

export async function currentAdmin(): Promise<Admin | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const { rows } = await db().query(
    `SELECT a.id, a.email, a.name FROM sessions s JOIN admins a ON a.id = s.admin_id
     WHERE s.id=$1 AND s.expires_at > now()`,
    [sha(token)],
  );
  return rows[0] ?? null;
}

type Ctx<P> = { params: Promise<P> };

/** Envolve um handler exigindo admin logado e (em métodos mutáveis) mesma origem. */
export function withAdmin<P = Record<string, never>>(
  handler: (req: Request, ctx: Ctx<P>, admin: Admin) => Promise<Response>,
) {
  return async (req: Request, ctx: Ctx<P>) => {
    if (req.method !== "GET" && !sameOrigin(req)) return fail("Origem não permitida", 403);
    const admin = await currentAdmin();
    if (!admin) return fail("Não autenticado", 401);
    return handler(req, ctx, admin);
  };
}

import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { db } from "./db";
import { fail, sameOrigin } from "./http";

export { hashPassword, verifyPassword } from "./auth-hash";

export const COOKIE = "gp_session";
const SESSION_DAYS = 7;

export const sha = (t: string) => createHash("sha256").update(t).digest("hex");
export const newToken = () => randomBytes(32).toString("base64url");

export type Role = "ADMIN" | "CLIENT";
export type User = { id: string; email: string; name: string; phone: string | null; role: Role };

export async function createSession(userId: string) {
  const token = newToken();
  const expires = new Date(Date.now() + SESSION_DAYS * 86400_000);
  await db().query("INSERT INTO sessions (id, user_id, expires_at) VALUES ($1,$2,$3)", [sha(token), userId, expires]);
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

/** Encerra todas as sessões do usuário, exceto (opcionalmente) a atual. */
export async function destroyOtherSessions(userId: string, keepCurrent = true) {
  const token = (await cookies()).get(COOKIE)?.value;
  await db().query("DELETE FROM sessions WHERE user_id=$1 AND ($2::text IS NULL OR id <> $2)", [
    userId,
    keepCurrent && token ? sha(token) : null,
  ]);
}

export async function currentUser(): Promise<User | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const { rows } = await db().query(
    `SELECT u.id, u.email, u.name, u.phone, u.role FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.id=$1 AND s.expires_at > now() AND u.is_active`,
    [sha(token)],
  );
  return rows[0] ?? null;
}

type Ctx<P> = { params: Promise<P> };
type Handler<P> = (req: Request, ctx: Ctx<P>, user: User) => Promise<Response>;

function guard<P>(role: Role | null, handler: Handler<P>) {
  return async (req: Request, ctx: Ctx<P>) => {
    if (req.method !== "GET" && !sameOrigin(req)) return fail("Origem não permitida", 403);
    const user = await currentUser();
    if (!user) return fail("Não autenticado", 401);
    if (role && user.role !== role) return fail("Sem permissão", 403);
    return handler(req, ctx, user);
  };
}

/** Exige usuário logado (qualquer papel). */
export const withUser = <P = Record<string, never>>(h: Handler<P>) => guard<P>(null, h);
/** Exige ADMIN. A checagem é sempre feita no servidor, a cada requisição. */
export const withAdmin = <P = Record<string, never>>(h: Handler<P>) => guard<P>("ADMIN", h);

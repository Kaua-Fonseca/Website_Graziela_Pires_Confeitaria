import { NextResponse } from "next/server";
import { ZodError, type ZodType } from "zod";

export const json = (data: unknown, status = 200) => NextResponse.json(data, { status });
export const fail = (message: string, status = 400) => json({ error: message }, status);

export function clientIp(req: Request): string {
  // CF-Connecting-IP é definido pela borda da Cloudflare.
  const cfIp = req.headers.get("cf-connecting-ip")?.trim();
  if (cfIp && cfIp.length <= 64) return cfIp;

  if (process.env.TRUST_PROXY === "true") {
    const xff = req.headers.get("x-forwarded-for");
    const first = xff?.split(",")[0]?.trim();
    if (first && first.length <= 64) return first;
  }
  return "unknown";
}

/** Bloqueia requisições mutáveis vindas de outra origem (defesa extra além do SameSite). */
export function sameOrigin(req: Request): boolean {
  const expected = new URL(req.url).origin;
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");

  try {
    if (origin) return new URL(origin).origin === expected;
    if (referer) return new URL(referer).origin === expected;
    // Requisições mutáveis sem Origin/Referer não são aceitas.
    return false;
  } catch {
    return false;
  }
}

export async function parse<T>(req: Request, schema: ZodType<T>): Promise<T | Response> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("JSON inválido");
  }
  try {
    return schema.parse(body);
  } catch (e) {
    if (e instanceof ZodError) return fail(e.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "), 422);
    throw e;
  }
}

export const isResponse = (v: unknown): v is Response => v instanceof Response;

export { slugify } from "../slug";

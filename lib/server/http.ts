import { NextResponse } from "next/server";
import { ZodError, type ZodType } from "zod";

export const json = (data: unknown, status = 200) => NextResponse.json(data, { status });
export const fail = (message: string, status = 400) => json({ error: message }, status);

export function clientIp(req: Request): string {
  if (process.env.TRUST_PROXY === "true") {
    const xff = req.headers.get("x-forwarded-for");
    if (xff) return xff.split(",")[0].trim();
  }
  return "unknown";
}

/** Bloqueia requisições mutáveis vindas de outra origem (defesa extra além do SameSite). */
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // clientes não-navegador (curl) não enviam Origin
  const host = req.headers.get("host");
  try {
    return new URL(origin).host === host;
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

export function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

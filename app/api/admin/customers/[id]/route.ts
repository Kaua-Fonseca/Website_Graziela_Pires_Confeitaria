import { z } from "zod";
import { withAdmin } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { fail, isResponse, json, parse } from "@/lib/server/http";
import { emailSchema, phoneSchema } from "@/lib/server/schemas";

const COLS = `id, name, email, phone, is_active AS "isActive", created_at AS "createdAt"`;
const UUID = /^[0-9a-f-]{36}$/i;

const schema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  email: emailSchema.optional(),
  phone: phoneSchema.nullable().or(z.literal("")).optional(),
  isActive: z.boolean().optional(),
});

// Todas as consultas filtram role='CLIENT': esta API nunca altera administradores.
export const GET = withAdmin<{ id: string }>(async (_req, { params }) => {
  const id = (await params).id;
  if (!UUID.test(id)) return fail("ID inválido", 400);
  const { rows } = await db().query(`SELECT ${COLS} FROM users WHERE id=$1 AND role='CLIENT'`, [id]);
  if (!rows[0]) return fail("Cliente não encontrado", 404);
  const { rows: q } = await db().query(
    `SELECT id, status, product_type AS "productType", created_at AS "createdAt" FROM quotes WHERE user_id=$1 ORDER BY id DESC LIMIT 20`,
    [id],
  );
  return json({ ...rows[0], quotes: q });
});

export const PATCH = withAdmin<{ id: string }>(async (req, { params }) => {
  const id = (await params).id;
  if (!UUID.test(id)) return fail("ID inválido", 400);
  const b = await parse(req, schema);
  if (isResponse(b)) return b;
  try {
    const { rows } = await db().query(
      `UPDATE users SET name=COALESCE($2,name), email=COALESCE($3,email),
         phone = CASE WHEN $4::boolean THEN NULLIF($5,'') ELSE phone END,
         is_active=COALESCE($6,is_active), updated_at=now()
       WHERE id=$1 AND role='CLIENT' RETURNING ${COLS}`,
      [id, b.name ?? null, b.email ?? null, b.phone !== undefined, b.phone ?? null, b.isActive ?? null],
    );
    if (!rows[0]) return fail("Cliente não encontrado", 404);
    if (b.isActive === false) await db().query("DELETE FROM sessions WHERE user_id=$1", [id]); // desativar derruba as sessões
    return json(rows[0]);
  } catch (e) {
    if ((e as { code?: string }).code === "23505") return fail("Já existe uma conta com esse e-mail", 409);
    throw e;
  }
});

// Exclui a conta; orçamentos ligados a ela são mantidos (user_id vira NULL) e as sessões são apagadas em cascata.
export const DELETE = withAdmin<{ id: string }>(async (_req, { params }) => {
  const id = (await params).id;
  if (!UUID.test(id)) return fail("ID inválido", 400);
  const { rowCount } = await db().query("DELETE FROM users WHERE id=$1 AND role='CLIENT'", [id]);
  return rowCount ? json({ ok: true }) : fail("Cliente não encontrado", 404);
});

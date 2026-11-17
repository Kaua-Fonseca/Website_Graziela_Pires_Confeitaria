import { z } from "zod";
import { newToken, sha } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { clientIp, fail, isResponse, json, parse, sameOrigin } from "@/lib/server/http";
import { sendMail, siteUrl } from "@/lib/server/mail";
import { hit } from "@/lib/server/rate-limit";
import { emailSchema } from "@/lib/server/schemas";

const schema = z.object({ email: emailSchema });
const MSG = "Se o e-mail estiver cadastrado, enviaremos as instruções para redefinir a senha.";

// Resposta idêntica exista a conta ou não (não revela quais e-mails estão cadastrados).
export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail("Origem não permitida", 403);
  const b = await parse(req, schema);
  if (isResponse(b)) return b;
  if (!(await hit("forgot-ip", clientIp(req), 10, 3600)) || !(await hit("forgot-email", b.email, 3, 3600))) {
    return json({ message: MSG });
  }
  const { rows } = await db().query("SELECT id, name, email FROM users WHERE lower(email)=$1 AND is_active", [b.email]);
  const u = rows[0];
  if (u) {
    const token = newToken();
    await db().query("DELETE FROM password_resets WHERE user_id=$1", [u.id]);
    await db().query("INSERT INTO password_resets (token_hash, user_id, expires_at) VALUES ($1,$2, now() + interval '1 hour')", [sha(token), u.id]);
    void sendMail(
      u.email,
      "Redefinição de senha — Graziela Pires Confeitaria",
      `Olá, ${u.name}!\n\nPara criar uma nova senha, acesse (válido por 1 hora):\n${siteUrl()}/#/redefinir?token=${token}\n\nSe você não pediu isso, ignore este e-mail.`,
    ).catch((e) => console.error("Falha ao enviar e-mail:", e.message));
  }
  return json({ message: MSG });
}

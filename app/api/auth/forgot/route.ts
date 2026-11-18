
import { z } from "zod";
import { newToken, sha } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import {
  clientIp,
  fail,
  isResponse,
  json,
  parse,
  sameOrigin,
} from "@/lib/server/http";
import { sendMail, siteUrl } from "@/lib/server/mail";
import { hit } from "@/lib/server/rate-limit";
import { emailSchema } from "@/lib/server/schemas";

const schema = z.object({ email: emailSchema });

const MSG =
  "Se o e-mail estiver cadastrado, enviaremos as instruções para redefinir a senha.";

export async function POST(req: Request) {

  try {
    if (!sameOrigin(req)) {
      return fail("Origem não permitida", 403);
    }

    const b = await parse(req, schema);

    if (isResponse(b)) {
      return b;
    }

    // Proteção contra excesso de solicitações.
    const ipAllowed = await hit(
      "forgot-ip",
      clientIp(req),
      10,
      3600
    );

    const emailAllowed = await hit(
      "forgot-email",
      b.email,
      3,
      3600
    );


    if (!ipAllowed || !emailAllowed) {
      return json({ message: MSG });
    }

    // Busca a conta no banco.
    const { rows } = await db().query(
      `SELECT id, name, email
       FROM users
       WHERE lower(email) = $1
       AND is_active`,
      [b.email]
    );

    const u = rows[0];

    console.log("[FORGOT] Conta encontrada:", !!u);

    // Mantém a mesma resposta para contas existentes ou inexistentes.
    if (!u) {
      return json({ message: MSG });
    }

    // Gera token seguro e salva somente seu hash.
    const token = newToken();

    await db().query(
      "DELETE FROM password_resets WHERE user_id = $1",
      [u.id]
    );

    await db().query(
      `INSERT INTO password_resets
       (token_hash, user_id, expires_at)
       VALUES ($1, $2, now() + interval '1 hour')`,
      [sha(token), u.id]
    );

    // Tenta enviar o e-mail e registra o resultado no terminal.
    try {
      console.log("[FORGOT] Tentando enviar e-mail...");

      await sendMail(
        u.email,
        "Redefinição de senha — Graziela Pires Confeitaria",
        `Olá, ${u.name}!

Para criar uma nova senha, acesse (válido por 1 hora):
${siteUrl()}/#/redefinir?token=${token}

Se você não pediu isso, ignore este e-mail.`
      );

      console.log("[FORGOT] E-mail enviado com sucesso!");
    } catch (error) {
      console.error("[FORGOT] Erro no envio:", error);
    }

    return json({ message: MSG });
  } catch (error) {
    console.error("[FORGOT] Erro na recuperação:", error);

    return fail("Não foi possível processar a solicitação.", 500);
  }
}

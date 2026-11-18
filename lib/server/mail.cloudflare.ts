import { env } from "cloudflare:workers";
import { Resend } from "resend";

type RuntimeEnv = {
  RESEND_API_KEY?: string;
  SITE_URL?: string;
  MAIL_FROM?: string;
};

const runtimeEnv = env as unknown as RuntimeEnv;

let resend: Resend | null = null;

function getResend(): Resend {
  if (!runtimeEnv.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY não configurada.");
  }

  resend ??= new Resend(runtimeEnv.RESEND_API_KEY);
  return resend;
}

export const siteUrl = () =>
  (runtimeEnv.SITE_URL ?? "http://localhost:3001").replace(/\/$/, "");

export async function sendMail(
  to: string,
  subject: string,
  text: string,
) {
  const { error } = await getResend().emails.send({
    from:
      runtimeEnv.MAIL_FROM ??
      "Graziela Pires Confeitaria <onboarding@resend.dev>",
    to,
    subject,
    text,
  });

  if (error) {
    throw new Error(`Falha ao enviar e-mail: ${error.message}`);
  }
}
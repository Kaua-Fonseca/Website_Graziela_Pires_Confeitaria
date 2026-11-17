import nodemailer from "nodemailer";

let transport: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransport() {
  if (!process.env.SMTP_HOST) return null;
  transport ??= nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
  return transport;
}

export const siteUrl = () => (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export async function sendMail(to: string, subject: string, text: string) {
  const t = getTransport();
  if (!t) {
    // Sem SMTP: em desenvolvimento o conteúdo vai para o console; em produção nada é registrado.
    if (process.env.NODE_ENV !== "production") console.log(`\n[e-mail para ${to}] ${subject}\n${text}\n`);
    else console.warn("SMTP não configurado: e-mail não enviado.");
    return;
  }
  await t.sendMail({ from: process.env.MAIL_FROM ?? process.env.SMTP_USER, to, subject, text });
}

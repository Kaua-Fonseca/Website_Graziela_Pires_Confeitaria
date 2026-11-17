import { CONTENT_FIELDS, SECTIONS, contentDefaults } from "../content";
import { db } from "./db";

export async function loadSite() {
  const content = contentDefaults();
  for (const r of (await db().query("SELECT key, value FROM site_content")).rows) {
    if (r.key in content) content[r.key] = r.value;
  }
  const sections: Record<string, boolean> = Object.fromEntries(SECTIONS.map((s) => [s.key, s.defaultEnabled]));
  for (const r of (await db().query("SELECT key, enabled FROM site_sections")).rows) {
    if (r.key in sections) sections[r.key] = r.enabled;
  }
  return { content, sections };
}

const MEDIA_URL = /^\/api\/media\/\d+$/;

/** Valida o valor de um campo conforme seu tipo; retorna mensagem de erro ou null. */
export function validateField(key: string, value: string): string | null {
  const f = CONTENT_FIELDS.find((x) => x.key === key);
  if (!f) return "Campo desconhecido";
  if (value === "") return null;
  if (value.length > (f.kind === "textarea" ? 2000 : 300)) return `${f.label}: texto muito longo`;
  if (f.kind === "url" && !/^https:\/\/[^\s]+$/.test(value)) return `${f.label}: use um link começando com https://`;
  if (f.kind === "image" && !MEDIA_URL.test(value) && !/^https:\/\/[^\s]+$/.test(value)) return `${f.label}: imagem inválida`;
  if (key === "contact.whatsapp" && !/^\d{10,15}$/.test(value)) return "WhatsApp: use só números, com DDI e DDD (ex.: 5545912345678)";
  if (key === "contact.email" && !/^\S+@\S+\.\S+$/.test(value)) return "E-mail de contato inválido";
  return null;
}

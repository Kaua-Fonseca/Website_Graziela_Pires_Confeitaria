import { z } from "zod";

const imageUrl = z.string().trim().max(500).refine((v) => v === "" || /^(https?:\/\/|\/)/.test(v), "URL inválida").default("");

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(300).default(""),
  image: imageUrl,
  position: z.number().int().min(0).default(0),
});

export const productSchema = z.object({
  name: z.string().trim().min(2).max(120),
  categoryId: z.number().int().positive().nullable().default(null),
  image: imageUrl,
  price: z.string().trim().max(60).default("Sob consulta"),
  detail: z.string().trim().max(500).default(""),
  active: z.boolean().default(true),
  position: z.number().int().min(0).default(0),
});

export const SELECT = `SELECT p.id, p.slug, p.name, p.category_id AS "categoryId", p.image,
  p.price_label AS price, p.detail, p.active, p.position, p.updated_at AS "updatedAt"
  FROM products p`;


export const emailSchema = z.string().trim().toLowerCase().email("E-mail inválido").max(200);
export const passwordSchema = z.string().min(10, "A senha precisa ter pelo menos 10 caracteres").max(128);
export const phoneSchema = z.string().trim().regex(/^[\d\s()+-]{8,20}$/, "Telefone inválido");

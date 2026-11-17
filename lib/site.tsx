"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { contentDefaults, SECTIONS } from "./content";
import { categories as fallbackCategories } from "@/data/categories";
import { products as fallbackProducts } from "@/data/products";
import { slugify } from "./slug";
import type { Category, Product, User } from "./types";

// Na versão estática (GitHub Pages) não existe API: o site usa os dados de reserva.
export const STATIC = process.env.NEXT_PUBLIC_STATIC_EXPORT === "true";

export type QuoteDraft = { productType?: string; idea?: string };

type Site = {
  c: (key: string) => string;
  on: (section: string) => boolean;
  products: Product[];
  categories: Category[];
  user: User | null;
  ready: boolean;
  setUser: (u: User | null) => void;
  draft: QuoteDraft;
  setDraft: (d: QuoteDraft) => void;
};

const defaults = contentDefaults();
const defaultSections = Object.fromEntries(SECTIONS.map((s) => [s.key, s.defaultEnabled]));
const fbCategories: Category[] = fallbackCategories.map(([name, description, image]) => ({ slug: slugify(name), name, description, image }));

const Ctx = createContext<Site | null>(null);

async function getJson<T>(url: string): Promise<T | null> {
  try {
    const r = await fetch(url, { credentials: "same-origin" });
    return r.ok ? ((await r.json()) as T) : null;
  } catch {
    return null;
  }
}

export function SiteProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState(defaults);
  const [sections, setSections] = useState<Record<string, boolean>>(defaultSections);
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [categories, setCategories] = useState<Category[]>(fbCategories);
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(STATIC);
  const [draft, setDraft] = useState<QuoteDraft>({});

  useEffect(() => {
    if (STATIC) return;
    let alive = true;
    (async () => {
      const [site, prods, cats, me] = await Promise.all([
        getJson<{ content: Record<string, string>; sections: Record<string, boolean> }>("/api/content"),
        getJson<Product[]>("/api/products"),
        getJson<Category[]>("/api/categories"),
        getJson<{ user: User | null }>("/api/auth/me"),
      ]);
      if (!alive) return;
      if (site) { setContent({ ...defaults, ...site.content }); setSections({ ...defaultSections, ...site.sections }); }
      if (prods) setProducts(prods);
      if (cats) setCategories(cats);
      setUser(me?.user ?? null);
      setReady(true);
    })();
    return () => { alive = false; };
  }, []);

  const c = useCallback((k: string) => content[k] ?? defaults[k] ?? "", [content]);
  const on = useCallback((k: string) => sections[k] ?? defaultSections[k] ?? true, [sections]);
  const value = useMemo(() => ({ c, on, products, categories, user, ready, setUser, draft, setDraft }), [c, on, products, categories, user, ready, draft]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSite(): Site {
  const v = useContext(Ctx);
  if (!v) throw new Error("useSite fora do SiteProvider");
  return v;
}

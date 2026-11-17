// Definição dos textos editáveis e das seções do site. Compartilhado entre servidor, painel e site público.
// Os padrões reproduzem o texto atual do site, então nada muda visualmente até a proprietária editar.

export type ContentField = {
  key: string;
  label: string;
  group: string;
  kind?: "text" | "textarea" | "image" | "url";
  default: string;
};

export const CONTENT_FIELDS: ContentField[] = [
  { key: "hero.eyebrow", group: "Início — topo", label: "Texto pequeno acima do título", default: "CONFEITARIA ARTESANAL · FOZ DO IGUAÇU" },
  { key: "hero.title1", group: "Início — topo", label: "Título (linha 1)", default: "Seu momento," },
  { key: "hero.title2", group: "Início — topo", label: "Título (linha 2, em destaque)", default: "em forma de doce." },
  { key: "hero.text", group: "Início — topo", label: "Subtítulo", kind: "textarea", default: "Bolos e doces personalizados, feitos à mão para a sua celebração." },
  { key: "hero.image", group: "Início — topo", label: "Imagem do banner", kind: "image", default: "" },
  { key: "hero.stamp1", group: "Início — topo", label: "Selo (linha pequena)", default: "Criado especialmente" },
  { key: "hero.stamp2", group: "Início — topo", label: "Selo (linha grande)", default: "para você" },

  { key: "journey.eyebrow", group: "Início — processo", label: "Texto pequeno", default: "SIMPLES E PERSONALIZADO" },
  { key: "journey.title1", group: "Início — processo", label: "Título (linha 1)", default: "Da sua ideia" },
  { key: "journey.title2", group: "Início — processo", label: "Título (linha 2, em destaque)", default: "à celebração." },
  { key: "journey.text", group: "Início — processo", label: "Texto", kind: "textarea", default: "Você conta o que imagina. Nós cuidamos dos sabores, do acabamento e de cada detalhe." },

  { key: "showcase.eyebrow", group: "Início — criações", label: "Texto pequeno", default: "CRIAÇÕES AUTORAIS" },
  { key: "showcase.title1", group: "Início — criações", label: "Título (linha 1)", default: "Feito para ser" },
  { key: "showcase.title2", group: "Início — criações", label: "Título (linha 2, em destaque)", default: "inesquecível." },
  { key: "showcase.text", group: "Início — criações", label: "Texto", kind: "textarea", default: "Veja inspirações reais e encontre o estilo do seu próximo bolo." },
  { key: "showcase.image", group: "Início — criações", label: "Imagem", kind: "image", default: "" },

  { key: "about.eyebrow", group: "Sobre a confeitaria", label: "Texto pequeno", default: "NOSSA HISTÓRIA" },
  { key: "about.title1", group: "Sobre a confeitaria", label: "Título (linha 1)", default: "Feito para transformar momentos em" },
  { key: "about.title2", group: "Sobre a confeitaria", label: "Título (em destaque)", default: "memórias." },
  { key: "about.history", group: "Sobre a confeitaria", label: "História", kind: "textarea", default: "Desde 2019, a Graziela Pires Confeitaria une técnica, afeto e olhar artístico para criar bolos e doces personalizados em Foz do Iguaçu." },
  { key: "about.mission", group: "Sobre a confeitaria", label: "Missão", kind: "textarea", default: "" },
  { key: "about.vision", group: "Sobre a confeitaria", label: "Visão", kind: "textarea", default: "" },
  { key: "about.values", group: "Sobre a confeitaria", label: "Valores", kind: "textarea", default: "" },
  { key: "about.purpose", group: "Sobre a confeitaria", label: "Propósito", kind: "textarea", default: "" },
  { key: "about.quote", group: "Sobre a confeitaria", label: "Frase em destaque", kind: "textarea", default: "Cada bolo carrega uma história. Nosso trabalho é torná-la ainda mais bonita — e deliciosa." },
  { key: "about.signature", group: "Sobre a confeitaria", label: "Assinatura", default: "Graziela Pires" },
  { key: "about.image", group: "Sobre a confeitaria", label: "Imagem", kind: "image", default: "" },

  { key: "contact.whatsapp", group: "Contato", label: "WhatsApp (só números, com DDI e DDD. Ex.: 5545912345678)", default: "" },
  { key: "contact.email", group: "Contato", label: "E-mail de contato", default: "" },
  { key: "contact.city", group: "Contato", label: "Cidade / estado", default: "Foz do Iguaçu — Paraná" },
  { key: "contact.hours", group: "Contato", label: "Horário de atendimento", default: "Ter a Sáb · 9h às 18h" },

  { key: "social.instagram_url", group: "Redes sociais", label: "Link do Instagram", kind: "url", default: "" },
  { key: "social.instagram_handle", group: "Redes sociais", label: "Nome do perfil no Instagram", default: "@grazielapiresconfeitaria" },

  { key: "footer.tagline", group: "Rodapé", label: "Frase do rodapé", kind: "textarea", default: "Bolos e doces artesanais personalizados para celebrar histórias únicas." },
  { key: "footer.copyright", group: "Rodapé", label: "Direitos autorais", default: "© 2025 Graziela Pires Confeitaria" },
];

export const CONTENT_KEYS = new Set(CONTENT_FIELDS.map((f) => f.key));
export const contentDefaults = (): Record<string, string> => Object.fromEntries(CONTENT_FIELDS.map((f) => [f.key, f.default]));

export type SectionDef = { key: string; label: string; defaultEnabled: boolean; page: string };

// Seções da página inicial, na ordem em que aparecem. As que não apareciam no site antes começam desativadas.
export const SECTIONS: SectionDef[] = [
  { key: "hero", label: "Banner principal", defaultEnabled: true, page: "Início" },
  { key: "categories", label: "Categorias", defaultEnabled: true, page: "Início" },
  { key: "journey", label: "Da ideia à celebração", defaultEnabled: true, page: "Início" },
  { key: "showcase", label: "Criações autorais", defaultEnabled: true, page: "Início" },
  { key: "naked", label: "Naked cake (tamanhos)", defaultEnabled: false, page: "Início" },
  { key: "custom", label: "Bolos sob medida (galeria)", defaultEnabled: false, page: "Início" },
  { key: "sweets", label: "Doces e cupcakes", defaultEnabled: false, page: "Início" },
  { key: "about", label: "Sobre / Nossa história", defaultEnabled: false, page: "Início" },
  { key: "faq", label: "Perguntas frequentes", defaultEnabled: false, page: "Início" },
  { key: "instagram", label: "Instagram e chamada final", defaultEnabled: false, page: "Início" },
  { key: "page.showroom", label: "Página Showroom", defaultEnabled: true, page: "Páginas" },
  { key: "page.catalog", label: "Página Catálogo", defaultEnabled: true, page: "Páginas" },
];

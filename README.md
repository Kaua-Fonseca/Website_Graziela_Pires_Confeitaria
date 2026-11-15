# Graziela Pires Confeitaria

Site institucional e catálogo visual para a Graziela Pires Confeitaria, desenvolvido com **Next.js + React + TypeScript**.

## Tecnologias

- Next.js 15 (App Router)
- React 19
- TypeScript
- CSS global responsivo

## Executar localmente

Requisitos: Node.js 20 ou superior e npm.

```bash
npm install
npm run dev
```

Acesse http://localhost:3000.

## Gerar build de produção

```bash
npm run build
npm start
```

## Escopo atual

Esta versão é a migração do protótipo visual do Figma Make para Next.js. O foco atual é o front-end: páginas e navegação visual, catálogo, showroom e formulário de orçamento. O backend (API, banco e login de admin) já existe, mas o front ainda não o consome; veja a seção Backend.

## Observação

A branch `migracao-nextjs-frontend` contém a migração em andamento. A branch `main` permanece preservada como versão original do Figma Make.

## Backend (API + PostgreSQL)

O backend vive no mesmo projeto Next.js (route handlers em `app/api`). Requer Node 20+ e PostgreSQL 14+.

```bash
cp .env.example .env.local        # ajuste DATABASE_URL
npm run db:migrate                # cria as tabelas (idempotente)
npm run db:seed                   # carrega categorias e produtos de data/
npm run admin:create -- voce@exemplo.com "Seu Nome"   # pede a senha (mín. 12 caracteres)
npm run dev
```

### Segurança
- Senhas com **Argon2id**; login por e-mail + senha.
- Sessão: token aleatório de 256 bits em cookie `HttpOnly` + `SameSite=Lax` (+ `Secure` em produção). No banco fica só o hash SHA-256 do token; validade de 7 dias.
- Rate limit: 5 falhas de login por e-mail+IP a cada 15 min; 5 orçamentos por IP a cada 10 min. Atrás de proxy/CDN, defina `TRUST_PROXY=true`, senão todos os visitantes compartilham o mesmo IP "unknown".
- Requisições mutáveis com `Origin` diferente do host são recusadas (defesa extra contra CSRF). **Sirva sempre em HTTPS em produção.**

### Endpoints
Públicos: `GET /api/categories`, `GET /api/products[?category=slug]`, `GET /api/products/:slug`, `POST /api/quotes`.

Admin (cookie de sessão): `POST /api/admin/login`, `POST /api/admin/logout`, `GET /api/admin/me`,
`GET|POST /api/admin/products`, `PUT|DELETE /api/admin/products/:id`,
`GET|POST /api/admin/categories`, `PUT|DELETE /api/admin/categories/:id`,
`GET /api/admin/quotes[?status=]`, `PATCH /api/admin/quotes/:id` (`{"status":"novo|em_contato|fechado|descartado"}`).

### GitHub Pages
O Pages publica só o front estático: o workflow define `STATIC_EXPORT=true` e remove `app/api` antes do build. A API precisa de um servidor Node (VPS, Railway, Render etc.).

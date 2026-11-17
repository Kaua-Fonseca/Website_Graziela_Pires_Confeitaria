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

Esta versão é a migração do protótipo visual do Figma Make para Next.js. Front-end completo (início, catálogo, produto, showroom, orçamento, conta de cliente) alimentado por API e banco; veja a seção Backend.

## Observação

A branch `migracao-nextjs-frontend` contém a migração em andamento. A branch `main` permanece preservada como versão original do Figma Make.

## Backend, painel administrativo e contas

O backend vive no mesmo projeto Next.js (route handlers em `app/api`) com PostgreSQL. A proprietária administra textos, produtos, preços, fotos e clientes pelo painel em `/admin`, sem mexer no código.

### Tecnologias
Next.js 15 (App Router) · React 19 · TypeScript · PostgreSQL (`pg`, SQL parametrizado) · Argon2id (`@node-rs/argon2`) · Zod (validação no servidor) · Nodemailer (e-mail) · ESLint.

### Requisitos
Node.js 20+, PostgreSQL 14+ e npm.

### Instalação e execução
```bash
npm install
cp .env.example .env.local                    # preencha DATABASE_URL (veja a tabela abaixo)
npm run db:migrate                            # cria/atualiza as tabelas (idempotente, versionado em db/migrations)
npm run db:seed                               # opcional: carrega as categorias e produtos iniciais de data/
npm run admin:create                          # cria o administrador: pede nome, e-mail e senha (mín. 12 caracteres)
npm run dev                                   # http://localhost:3000  ·  painel em /admin
```
O banco precisa existir antes (`CREATE DATABASE graziela;`). Em CI ou script, `ADMIN_PASSWORD=... npm run admin:create -- email@exemplo.com "Nome"` evita o prompt. Administradores só são criados por este comando; o cadastro pelo site sempre gera contas `CLIENT`.

### Variáveis de ambiente
| Variável | Para que serve |
|---|---|
| `DATABASE_URL` | Conexão com o PostgreSQL (obrigatória) |
| `SITE_URL` | URL pública, usada no link do e-mail de redefinição de senha |
| `TRUST_PROXY` | `true` atrás de proxy/CDN confiável, para o limite de tentativas enxergar o IP real |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` | E-mail da recuperação de senha. Sem `SMTP_HOST` nenhum e-mail é enviado |
| `UPLOAD_DIR` | Pasta das fotos enviadas (padrão `./uploads`) |

Nenhuma credencial vai para o repositório: `.env*` está no `.gitignore` (exceto `.env.example`).

### O que o painel faz
Dashboard · textos, contatos, redes sociais e história/missão/visão/valores/propósito · ligar e desligar seções do site · produtos e categorias (preço, descrição, foto, ordem, mostrar/ocultar) · biblioteca de imagens (prévia, troca, exclusão, texto alternativo) · clientes (busca, edição, desativar, excluir) · orçamentos recebidos (situação e link para o WhatsApp).

### Segurança
- Senhas com **Argon2id**; nunca em texto puro. Tempo de resposta equalizado no login (não revela se o e-mail existe).
- Sessão: token aleatório de 256 bits em cookie `HttpOnly` + `SameSite=Lax` + `Secure` em produção; no banco fica só o SHA-256 do token. Validade de 7 dias; trocar a senha derruba as outras sessões.
- Permissões `ADMIN` / `CLIENT` verificadas no servidor em toda rota `/api/admin/*` e no painel; cliente recebe 403.
- Limite de tentativas: login (5 falhas por e-mail+IP / 15 min), cadastro, recuperação de senha, troca de senha e orçamentos.
- Recuperação de senha: token de uso único, validade de 1 hora, guardado só como hash; a resposta é igual exista a conta ou não.
- Requisições que alteram dados com `Origin` diferente do host são recusadas (CSRF), além do `SameSite`.
- Entradas validadas com Zod no servidor; SQL sempre parametrizado; React escapa o HTML (XSS).
- Upload: só JPG, PNG e WebP (tipo conferido pela assinatura do arquivo, não pelo nome), máx. 5 MB, nome gerado no servidor, servido com `nosniff`. SVG é recusado de propósito.
- Erros inesperados não expõem detalhes internos.

### Testes
Com o servidor rodando e um administrador criado:
```bash
BASE=http://localhost:3000 ADMIN_EMAIL=voce@exemplo.com ADMIN_PASSWORD=... npm run test:api
npm run typecheck && npm run lint && npm run build
```
`test:api` percorre cadastro, login, permissões, recuperação de senha, produtos, conteúdo, seções, upload (inclusive arquivo malicioso) e limite de tentativas, e apaga os dados de teste no final.

### Produção
1. Use HTTPS (o cookie de sessão é `Secure`) e defina `SITE_URL`, `SMTP_*` e, atrás de proxy, `TRUST_PROXY=true`.
2. `npm run build && npm start` em um servidor Node (VPS, Railway, Render etc.). Rode `npm run db:migrate` a cada deploy.
3. Faça backup do banco **e** da pasta `UPLOAD_DIR`. Em hospedagem com disco efêmero, aponte `UPLOAD_DIR` para um volume persistente.
4. Crie o administrador com `npm run admin:create` no servidor.

### GitHub Pages
O Pages publica só o front estático (sem contas, painel nem banco): o workflow define `STATIC_EXPORT=true` e remove `app/api` e `app/admin` antes do build. Nesse modo o site usa os dados de reserva de `data/` e `lib/content.ts`.

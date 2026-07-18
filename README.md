# Vault — Cofre Digital Pessoal

SaaS completo: Next.js 15 (App Router) · TypeScript estrito · Tailwind CSS · Prisma ·
PostgreSQL (Supabase) · NextAuth.js · Stripe · Resend + React Email · Cloudinary.

## Status deste build

Este projeto foi desenvolvido em um sandbox **sem acesso à internet geral** (só npm/GitHub).
Por isso, duas coisas precisam ser feitas no seu ambiente antes de rodar contra dados reais:

1. **Gerar o Prisma Client** — os binários do Prisma não puderam ser baixados aqui:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init   # depois de configurar DATABASE_URL/DIRECT_URL
   ```
2. **Fonte Inter via Google Fonts** — não pôde ser baixada no sandbox (cai no fallback
   automaticamente); funciona normalmente com internet liberada.

**Tudo o que não depende de rede externa foi validado**: `tsc --noEmit` limpo (exceto o
erro esperado de `@prisma/client` até você gerar o client), `eslint` sem erros, e todas as
rotas testadas via `next dev` retornando 200 com dados de demonstração
(`src/lib/mock-data.ts` + `src/lib/vault-store.ts`, um store Zustand client-side).

## O que já funciona de ponta a ponta (com dados mock)

- Sistema de pastas hierárquicas: árvore expansível na sidebar, breadcrumb clicável,
  drag & drop de itens/pastas (inclusive soltando no breadcrumb para subir de nível),
  clique direito com menu contextual, grid masonry e lista estilo Finder/Drive com
  colunas ordenáveis, seleção múltipla (shift/cmd+click, cmd+A) com barra de ações em lote.
- Os 7 tipos de item com preview dedicado: imagem (zoom), PDF (iframe), áudio (player +
  waveform ilustrativa), nota (markdown), snippet (syntax highlight simplificado — ponto
  de integração para Monaco já isolado em `item-viewer.tsx`), link (card com OG preview),
  senha (campo oculto + gerador + fluxo de senha mestra).
- Command palette (⌘K), tema claro/escuro, toasts com desfazer, skeletons e estados vazios.
- Landing page completa (hero, features, segurança, pricing anual/mensal, FAQ, CTA final)
  seguindo princípios de conversão (ancoragem de preço, prova de confiança, objeções no FAQ).
- Todas as Server Actions (`src/actions/*`) e rotas de API (`src/app/api/*`) estão escritas
  contra o schema Prisma real e prontas para uso — elas só precisam do banco conectado.

## Como colocar em produção

1. Crie um projeto em [Supabase](https://supabase.com), copie as connection strings para
   `.env` (veja `.env.example`).
2. `npx prisma generate && npx prisma migrate dev --name init`
3. Configure Cloudinary, Stripe (produtos Pro/Business + webhook) e Resend — chaves em `.env`.
4. Troque as chamadas ao `useVaultStore` (mock, em `src/lib/vault-store.ts`) pelas Server
   Actions equivalentes em `src/actions/` conforme for conectando cada tela ao banco real.
5. `npm run build && npm start`.

## Segurança do cofre de senhas

- AES-256-GCM por segredo, chave derivada via PBKDF2 (120k iterações) da senha mestra do
  usuário + salt único (`src/lib/crypto.ts`).
- A senha mestra nunca é armazenada — apenas um hash de verificação (`vaultMasterKeyHash`).
- `revealPassword` (Server Action) só decifra em memória, na resposta da requisição.

## Estrutura

Segue a árvore especificada no briefing: `src/app/(auth|dashboard|landing)`,
`src/components/{ui,vault,dashboard,landing,providers}`, `src/actions`, `src/lib`,
`src/emails`, `src/hooks`, `src/types`, `prisma/schema.prisma`, `src/middleware.ts`.

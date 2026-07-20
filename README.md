# Vault — Cofre Digital Pessoal

Vault é um SaaS de armazenamento pessoal: um lugar único para guardar imagens, PDFs,
áudios, notas em markdown, snippets de código, links com preview e senhas — organizados
em pastas hierárquicas, com a experiência de navegação de um Google Drive / Finder do
macOS (árvore de pastas, breadcrumb, grid e lista, drag & drop, seleção múltipla, menu de
contexto e busca instantânea).

---

## Sumário

- [Stack tecnológica](#stack-tecnológica)
- [Status atual do projeto](#status-atual-do-projeto)
- [Funcionalidades](#funcionalidades)
- [Identidade visual](#identidade-visual)
- [Modelo de dados](#modelo-de-dados)
- [Segurança do cofre de senhas](#segurança-do-cofre-de-senhas)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Como rodar localmente](#como-rodar-localmente)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Scripts disponíveis](#scripts-disponíveis)
- [Do mock ao banco real](#do-mock-ao-banco-real)
- [Roadmap](#roadmap)
- [Limitações conhecidas](#limitações-conhecidas)

---

## Stack tecnológica

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 15 (App Router, Server Actions) |
| Linguagem | TypeScript estrito (sem `any`) |
| Estilo | Tailwind CSS v4 |
| Estado do cliente | Zustand |
| Animações | Motion (Framer Motion) |
| ORM | Prisma |
| Banco de dados | PostgreSQL (Supabase) |
| Autenticação | NextAuth.js (Credentials + Google) |
| Pagamentos | Stripe |
| E-mail transacional | Resend + React Email |
| Upload de arquivos | Cloudinary |
| Editor de código | Monaco Editor |
| Componentes acessíveis | Radix UI (Dialog, Dropdown, Context Menu, Tooltip) |
| Busca global | `cmdk` (command palette) |
| Drag & drop | HTML5 Drag and Drop API nativa |
| Validação | Zod |

---

## Status atual do projeto

O projeto está estruturado como um SaaS completo, com **integração real com o banco de dados PostgreSQL (via Prisma)** e sincronização de estado com o cliente utilizando **Zustand**. 

Principais fluxos integrados e funcionais:
- ✅ **Persistência Completa no Banco:** Criação, renomeação, exclusão (soft delete/lixeira), arquivamento e favoritos para pastas e todos os tipos de itens salvos em tempo real no banco de dados.
- ✅ **Cofre de Senhas Criptografado:** Criptografia AES-256-GCM em tempo real com derivação de chave PBKDF2. Inclui criação da senha mestra inicial, cadastro de segredos criptografados, revelação segura e troca de senha mestra (com re-criptografia automática dos itens).
- ✅ **Configurações Dinâmicas:** Perfil do usuário e dados de segurança lidos e salvos diretamente no banco de dados e sincronizados no Zustand.
- ✅ **Salvamento Manual e Alerta de Saída:** Editores de Notas e Snippets com salvamento manual (botão e atalhos), indicadores de alterações pendentes, e modal personalizado de confirmação de saída (`UnsavedChangesModal`) para evitar perda de dados.
- ✅ **Personalização de Pastas:** Definição e alteração de cores das pastas de forma dinâmica no banco.
- ✅ **Interface de Autenticação Premium:** Telas de Login e Registro com layout moderno em duas colunas, toggles de visualização de senha e layouts responsivos de alta fidelidade.

---

## Funcionalidades

### Organização (estilo Google Drive / Finder)

- Pastas aninhadas infinitamente, com uma pasta raiz fixa ("Meu Vault") por usuário.
- Breadcrumb clicável no topo, incluindo suporte a **soltar itens diretamente em um nível
  do breadcrumb** para mover para cima na hierarquia.
- Duas visualizações alternáveis: **grid masonry** (cards) e **lista** (tabela estilo
  Finder com colunas Nome, Tipo, Tamanho, Modificado em, Tags).
- Ordenação por nome, tipo, tamanho ou data — clicando no cabeçalho da coluna alterna
  crescente/decrescente.
- Drag & drop nativo (HTML5): arrastar itens e pastas para dentro de outras pastas, com
  destaque visual (`drop-target-active`) na pasta/breadcrumb de destino durante o arraste.
- Menu de contexto (clique direito) com ações diferentes para item, pasta ou área vazia.
- Sidebar com árvore de pastas expansível/colapsável, contador de itens por pasta,
  atalhos fixos (Favoritos, Senhas, Arquivados, Lixeira) e criação de pasta com input
  inline.
- Seleção múltipla: `Shift+clique` (intervalo), `Ctrl/Cmd+clique` (individual),
  `Ctrl/Cmd+A` (selecionar tudo), com barra de ações em lote (mover, favoritar, arquivar,
  tags, excluir) que aparece flutuando na parte inferior da tela.
- Command palette (`Ctrl/Cmd+K`) para busca global por pastas e itens, com atalhos
  diretos para Favoritos, Senhas, Arquivados e Lixeira.

### Tipos de item (cada um com preview dedicado)

| Tipo | Armazenamento | Preview |
|---|---|---|
| Imagem | Cloudinary | Grid masonry + visualizador com zoom |
| PDF | Cloudinary | `<iframe>` do próprio arquivo |
| Áudio | Cloudinary | Player HTML5 nativo + waveform ilustrativa |
| Nota | Banco (texto) | Markdown renderizado |
| Snippet | Banco (texto) | **Monaco Editor real**, com syntax highlight, 17 linguagens, auto-save e tema customizado (claro/escuro) |
| Link | Banco (URL) | Card com preview estilo OG (título, descrição, imagem) |
| Senha | Banco (criptografado) | Campo oculto, revelado apenas com a senha mestra |

Todo item suporta: título, descrição, tags múltiplas, cor de etiqueta (6 opções),
favorito, arquivamento e soft delete (lixeira).

### Cofre de senhas

- Criptografia **AES-256-GCM** por segredo (usuário, senha e notas são cifrados
  separadamente).
- Chave de criptografia derivada via **PBKDF2 (120.000 iterações)** a partir de uma
  **senha mestra**, independente da senha de login.
- Gerador de senhas integrado (tamanho, maiúsculas, números, símbolos) usando
  `crypto.getRandomValues`.
- Indicador de força da senha (fraca / média / forte).
- Botão "Copiar" com aviso de limpeza do clipboard após 30 segundos.

### Dashboard e conta

- Header com busca global, toggle grid/lista, toggle de tema claro/escuro, dropdown
  "Novo" (upload, nota, snippet, link, senha, pasta) e dropdown de usuário.
- Página de detalhe do item em tela cheia, com painel lateral de metadados e ações
  (editar, favoritar, mover, compartilhar, arquivar, excluir).
- Configurações: perfil, segurança (troca de senha mestra, exportação de dados,
  exclusão de conta) e plano/faturamento (comparação Free / Pro / Business).
- Lixeira com soft delete — itens excluídos ficam recuperáveis por 30 dias
  (`purgeExpiredTrash` em `src/actions/items.ts`, pensado para rodar via cron job).
- Toda a UI cobre estados de loading (skeletons), vazio (ilustração + CTA), erro e
  sucesso (toasts com ação de desfazer, via `sonner`).

### Landing page

Hero, seção de recursos, seção de segurança (com trecho de código real do fluxo de
criptografia), pricing com toggle mensal/anual e plano em destaque, FAQ e CTA final —
seguindo princípios de conversão (ancoragem de preço, prova de confiança, objeções
respondidas no FAQ).

---

## Identidade visual

Tema roxo, definido inteiramente por CSS variables em `src/app/globals.css`:

- **Primária**: `violet-600` (`#7C3AED`)
- **Interações/accent**: `purple-500` (`#A855F7`)
- **Fundo claro**: `violet-50` / `violet-100`
- **Fundo escuro**: `stone-950` com viés violeta
- **Gradiente de marca**: `violet-600 → purple-500`
- **Fonte**: Inter (`next/font/google`)
- **6 cores de etiqueta**: violeta, rosa, âmbar, esmeralda, céu, pedra

O tema é alternado via `ThemeProvider` (`src/components/providers/theme-provider.tsx`),
persistido em `localStorage` e aplicado através da classe `.dark` na raiz do documento.

---

## Modelo de dados

Definido em `prisma/schema.prisma`. Modelos principais:

- **User** — dados de conta, hash da senha mestra do cofre (`vaultMasterKeyHash`) e salt
  (`vaultSalt`), plano, uso/limite de armazenamento, campos de integração com Stripe.
- **Folder** — pastas com auto-relacionamento (`parentId` → `FolderHierarchy`), cor,
  ícone, flag `isRoot`.
- **Item** — modelo único para todos os 7 tipos, com campos específicos por tipo
  (`codeContent`/`codeLanguage` para snippets, `encryptedPassword` para senhas,
  `linkOgImage` para links etc.), soft delete (`isDeleted`/`deletedAt`) e campos
  reservados para busca semântica futura (`embedding` via `pgvector`, `aiTags`,
  `aiSummary`).
- **Account** / **Session** / **VerificationToken** — modelos padrão do adapter Prisma
  do NextAuth.

O banco de dados usa a extensão `pgvector` do Postgres (já habilitada no schema via
`extensions = [vector]`), preparando o terreno para uma futura busca por similaridade.

---

## Segurança do cofre de senhas

Implementada em `src/lib/crypto.ts` e consumida pelas Server Actions em
`src/actions/vault-crypto.ts`:

1. O usuário define uma senha mestra, **diferente da senha de login**.
2. É gerado um `salt` único por usuário (`generateSalt`) e um hash de verificação
   (`hashMasterPassword`, PBKDF2 + SHA-512) — a senha mestra em si **nunca é
   armazenada**.
3. Para cifrar/decifrar um segredo, a chave AES-256 é **derivada em memória**, a cada
   operação, a partir da senha mestra fornecida + salt do usuário (`deriveKey`).
4. Cada segredo (usuário, senha, notas) é cifrado individualmente com
   **AES-256-GCM** (`encryptSecret` / `decryptSecret`), com IV aleatório e tag de
   autenticação por operação.
5. `revealPassword` (Server Action) só decifra a senha **na resposta da própria
   requisição** — o texto plano nunca é persistido no cliente nem em cache.
6. Trocar a senha mestra implica re-cifrar todos os itens `PASSWORD` do usuário (ponto
   já sinalizado com `TODO(produção)` em `src/app/(dashboard)/settings/security/page.tsx`).

---

## Estrutura do projeto

```
src/
├── app/
│   ├── (auth)/                     # login, registro, verificação de e-mail, reset de senha
│   ├── (dashboard)/
│   │   ├── vault/                  # raiz, pastas, item, favoritos, senhas, arquivados, lixeira, busca
│   │   └── settings/               # perfil, segurança, plano/faturamento
│   ├── (landing)/                  # landing page pública
│   ├── api/
│   │   ├── auth/[...nextauth]/     # rota do NextAuth
│   │   ├── upload/                 # upload → Cloudinary → cria Item
│   │   └── webhooks/stripe/        # eventos de assinatura
│   ├── globals.css                 # tokens de design (cores, sombras, animações)
│   └── layout.tsx                  # layout raiz (fonte, tema, toasts)
├── actions/                        # Server Actions: folders, items, vault-crypto, user
├── components/
│   ├── ui/                         # primitivas: button, input, dialog, dropdown-menu, context-menu, tooltip...
│   ├── vault/                      # árvore de pastas, grid/lista, viewers por tipo, editor de snippet...
│   ├── dashboard/                  # sidebar, header, command palette, storage bar...
│   ├── landing/                    # hero, features, pricing, faq, footer...
│   └── providers/                  # theme-provider
├── emails/                         # templates React Email: welcome, verify, reset, upgrade
├── hooks/                          # use-auto-save, use-keyboard-shortcuts, use-selection...
├── lib/                            # auth, db, crypto, cloudinary, stripe, email, vault-store, validators...
├── types/                          # tipos de domínio (Folder, VaultItem, etc.)
└── middleware.ts                   # protege /vault e /settings por cookie de sessão
prisma/
└── schema.prisma
```

---

## Como rodar localmente

```bash
# 1. Instalar dependências
npm install

# 2. Copiar variáveis de ambiente
cp .env.example .env
# preencha ao menos DATABASE_URL, DIRECT_URL e NEXTAUTH_SECRET para persistência real

# 3. Gerar o Prisma Client e aplicar o schema
npx prisma generate
npx prisma migrate dev --name init

# 4. Rodar em desenvolvimento
npm run dev
```

A aplicação sobe em `http://localhost:3000`. A landing page fica em `/`, a área
autenticada em `/vault` (protegida pelo middleware) e as configurações em `/settings`.

> Enquanto o banco não estiver conectado, o app funciona normalmente usando os dados de
> demonstração do `vault-store.ts` — não é necessário configurar nada para explorar a UI.

---

## Variáveis de ambiente

Todas documentadas em `.env.example`:

| Variável | Uso |
|---|---|
| `DATABASE_URL` / `DIRECT_URL` | Conexão pooled e direta com o Postgres (Supabase) |
| `NEXTAUTH_URL` / `NEXTAUTH_SECRET` | Configuração base do NextAuth |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Login social com Google |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Upload de imagens, PDFs e áudios |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Cobrança e eventos de assinatura |
| `STRIPE_PRICE_PRO` / `STRIPE_PRICE_BUSINESS` | IDs de preço dos planos pagos |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Checkout no client |
| `RESEND_API_KEY` | Envio de e-mails transacionais |

---

## Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento (Next.js) |
| `npm run build` | Build de produção |
| `npm run start` | Inicia o build de produção |
| `npm run lint` | Roda o ESLint |
| `npx prisma generate` | Gera o Prisma Client a partir do schema |
| `npx prisma migrate dev` | Cria/aplica uma migration no banco |
| `npx prisma studio` | Interface visual para inspecionar o banco |

---

## Integração de Dados

A persistência do app é totalmente dinâmica. O front-end utiliza **Zustand** para o estado reativo síncrono e dispara **Server Actions** em segundo plano para persistir as operações diretamente no banco PostgreSQL. O `DashboardLayout` é o responsável por buscar os dados reais via Server Components na montagem inicial e injetar no Zustand no client.

---

## Roadmap

- [x] Conectar todas as telas principais ao Postgres via Prisma (pastas, itens, notas, snippets, senhas e configurações)
- [ ] Upload real de arquivos para Cloudinary com barra de progresso
- [ ] Preview OG automático ao colar um link (scraping de metadados)
- [ ] Histórico de versões para notas e snippets (plano Pro)
- [ ] Compartilhamento de itens/pastas entre usuários (plano Business)
- [ ] Busca semântica com embeddings + `pgvector` (campo `embedding` já reservado no schema)
- [ ] Exportação de notas para Markdown / HTML / PDF
- [ ] Testes automatizados (unitários para `lib/crypto.ts` e E2E para os fluxos principais)

---

## Limitações conhecidas

- O editor de snippets usa Monaco Editor completo na página de detalhe do item; o card
  do grid mostra um preview leve (texto simples) por razão de performance — carregar uma
  instância do Monaco por card seria custoso com muitos itens na tela.
- A rota `/api/upload` e o fluxo de OG preview de links ainda não têm o lado de scraping
  de metadados implementado — hoje o link é salvo apenas com a URL.
- Não há testes automatizados neste momento.
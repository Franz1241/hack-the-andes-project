# hack-the-andes-project

pnpm monorepo: Hono + oRPC API on Cloudflare Workers (`apps/server`), Vite SPA (`apps/web`), Expo app (`apps/native`), better-auth, Drizzle + MySQL through Hyperdrive, evlog wide-event logging, deployed with Alchemy v2 (local state in `packages/infra/.alchemy/`).

## Setup

1. `pnpm install` (generates the typed env files from every `.env.schema`).
2. Secrets (gitignored):
   - `apps/server/.env` → `BETTER_AUTH_SECRET` (`openssl rand -base64 32`)
   - `packages/db/.env` → `DATABASE_URL=mysql://…@vero:3306/fierros` (vero over Tailscale)
3. `pnpm infra:login` once to connect the `cloudflare-franz` Alchemy profile (`pnpm infra:refresh` when the token expires).
4. `pnpm db:push` to create the `hack_the_andes_*` tables.

Public URLs live in tracked files: `.env.schema` defaults are the localhost values and `.env.production` overrides them on deploy (`APP_ENV=production`).

## Scripts

| Script | What it does |
| --- | --- |
| `pnpm dev` | `alchemy dev`: server on :3000, web on :3001, Hyperdrive pointed at `DATABASE_URL` |
| `pnpm dev:native` | Expo dev server |
| `pnpm build` / `pnpm check-types` / `pnpm test` | Build, type-check and test every package |
| `pnpm deploy` | Deploy server + web to the `prod` stage |
| `pnpm deploy:server` / `pnpm deploy:web` | Deploy a single Worker |
| `pnpm deploy:plan` | Preview the deploy without applying it |
| `pnpm logs:server` / `pnpm logs:web` | Tail Workers Logs (evlog events + CPU time) |
| `pnpm build:native:android` / `:ios` | Local EAS build (preview profile) |
| `pnpm build:native:cloud:android` / `:ios` | Remote EAS build (preview profile) |
| `pnpm build:native:prod:android` / `:ios` | Remote EAS production build |
| `pnpm db:push` / `db:generate` / `db:migrate` / `db:studio` | drizzle-kit against `DATABASE_URL` |

## Auth

Every server route requires a session except `/`, `/api/auth/*` and the procedures listed in `PUBLIC_PROCEDURE_PATHS`. Browser origins allowed for CORS and better-auth come from the comma-separated `ALLOWED_ORIGINS`.

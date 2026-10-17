# hack-the-andes-project

pnpm monorepo: Hono + oRPC API on Cloudflare Workers (`apps/server`), Vite SPA (`apps/web`), Expo app (`apps/native`), cron scraper Worker for road/emergency feeds (`apps/scraper`, see its README), better-auth, Drizzle + MySQL through Hyperdrive, evlog wide-event logging, deployed with Alchemy v2 (local state in `packages/infra/.alchemy/`).

## Product docs

[Project brief](docs/project_brief.md)

## Setup

1. `pnpm install` (generates the typed env files from every `.env.schema`).
2. Secrets (gitignored):
   - `apps/server/.env` → `BETTER_AUTH_SECRET` (`openssl rand -base64 32`)
   - `packages/db/.env` → `DATABASE_URL=mysql://…@vero:3306/fierros` (vero over Tailscale)
   - `apps/scraper/.env` → `SCRAPER_RUN_SECRET` (`openssl rand -base64 32`), `JEV_API_KEY`, and `B2_MEDIA_KEY_ID` / `B2_MEDIA_APPLICATION_KEY` (B2 key scoped to the `illapa-media` bucket)
3. `pnpm infra:login` once to connect the `cloudflare-franz` Alchemy profile (`pnpm infra:refresh` when the token expires).
4. `pnpm db:push` to create the `hack_the_andes_*` tables.

Public URLs live in tracked files: `.env.schema` defaults are the localhost values and `.env.production` overrides them on deploy (`APP_ENV=production`).

## Production domains and deployment

Illapa's dashboard is served at `https://dash.illapa.app` and its API at `https://api.illapa.app`. Alchemy attaches both as Worker custom domains using the hostnames in `packages/infra/constants.ts`. The existing `workers.dev` URLs remain enabled, and the old web origin stays trusted during cutover. Better Auth uses the API domain in production and `http://localhost:3000` locally.

Before deploying, authenticate the `cloudflare-franz` profile and provide the gitignored secrets listed in Setup, preserving the existing `BETTER_AUTH_SECRET`. The `illapa.app` zone must be active in that account. Resolve any conflicting CNAME records or attachments to another Worker for `dash` and `api`; no manual DNS records are otherwise needed, because [Cloudflare custom domains provision DNS and TLS](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/).

For the first cutover, run `pnpm deploy:server`, wait until `https://api.illapa.app/api/auth/ok` responds successfully over HTTPS, then run `pnpm deploy:web`. These commands deploy each Worker independently. `pnpm deploy` deploys the full stack (server, web, and scraper) concurrently; use it for subsequent full releases.

## Scripts

| Script | What it does |
| --- | --- |
| `pnpm dev` | `alchemy dev`: server on :3000, web on :3001, scraper on :3002, Hyperdrive pointed at `DATABASE_URL` |
| `pnpm dev:native` | Expo dev server |
| `pnpm build` / `pnpm check-types` / `pnpm test` | Build, type-check and test every package |
| `pnpm deploy` | Deploy server + web + scraper to the `prod` stage |
| `pnpm deploy:server` / `pnpm deploy:web` / `pnpm deploy:scraper` | Deploy a single Worker |
| `pnpm deploy:plan` | Preview the deploy without applying it |
| `pnpm logs:server` / `pnpm logs:web` / `pnpm logs:scraper` | Tail Workers Logs (evlog events + CPU time) |
| `pnpm build:native:android` / `:ios` | Local EAS build (preview profile) |
| `pnpm build:native:cloud:android` / `:ios` | Remote EAS build (preview profile) |
| `pnpm build:native:prod:android` / `:ios` | Remote EAS production build |
| `pnpm db:push` / `db:generate` / `db:migrate` / `db:studio` | drizzle-kit against `DATABASE_URL` |

## Auth

Every server route requires a session except `/`, `/api/auth/*` and the procedures listed in `PUBLIC_PROCEDURE_PATHS`. Browser origins allowed for CORS and better-auth come from the comma-separated `ALLOWED_ORIGINS`.

## Dashboard and fleet tracking

The dashboard at `dash.illapa.app` combines incident feeds with organization-scoped Geotab and Samsara vehicles, trips, ETAs, and hazard alerts. The fleet-sync Worker polls GPS providers every two minutes; shared rules live in `packages/business`.

See the [dashboard plan and operations notes](docs/dashboard-plan.md), [fleet-sync runbook](apps/fleet-sync/README.md), and [business module map](packages/business/README.md).

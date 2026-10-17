# fleet-sync

Cloudflare Worker that polls active Geotab and Samsara connections, stores newer GPS positions, and evaluates active trips against active alertable incidents. It updates ETAs, reroutes off-route vehicles, completes arrivals, and maintains Spanish hazard alerts with an alternative route when available. Each run emits one evlog event containing connection and trip results.

The cron is `*/2 * * * *` (`FLEET_SYNC_CRON` in `packages/infra/constants.ts`). Local cron ticks are not simulated; `pnpm dev` serves the Worker on port 3003.

```sh
curl -X POST -H "x-fleet-sync-secret: $FLEET_SYNC_RUN_SECRET" http://localhost:3003/run
curl -X POST -H "x-fleet-sync-secret: $FLEET_SYNC_RUN_SECRET" 'http://localhost:3003/run?connection=<id>'
```

A connection-specific run also evaluates only that connection's trips and can retry a connection in `error` status. Failed runs return HTTP 500 with per-item results; an unknown connection returns 404. Acknowledged alerts keep their status. An alternative-routing failure still creates the hazard alert without a suggested route.

Environment variables are declared in `.env.schema` and bound in `packages/infra/fleet-sync.ts`:

- `FLEET_SYNC_RUN_SECRET`: secret protecting manual runs; stored in the gitignored `.env` and imported by infra from this app.
- `CREDENTIALS_ENCRYPTION_KEY`: base64 AES-256 key. It must match the server key used to encrypt GPS credentials. Infra imports the shared key from the server app; the local fleet-sync `.env` also needs it for standalone env validation.
- `OSRM_BASE_URL`: routing endpoint, default `https://router.project-osrm.org`; public production value in `.env.production`. Infra imports the shared value from the server app.
- `APP_ENV`: environment name, supplied by the stack.
- `HYPERDRIVE`: shared database binding supplied by Alchemy.
- `SERVICE_VERSION`: build identity resolved from git by infra.

Generate local secrets with `openssl rand -base64 32`. Use `pnpm deploy:fleet-sync` to deploy and `pnpm logs:fleet-sync` to tail logs.

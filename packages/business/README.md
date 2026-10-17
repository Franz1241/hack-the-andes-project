# Business logic

`@hack-the-andes-project/business` contains the shared fleet rules used by the API and fleet-sync Worker. Import from the package root or a module path such as `@hack-the-andes-project/business/fleet/evaluate-trip`.

## Modules and entry points

- `fleet/sync-connection.ts`: `syncConnection` decrypts a connection's credentials, imports vehicles and stores newer positions in batches. History IDs are deterministic across retries; older readings cannot overwrite a newer checkpoint. Provider errors become fixed, credential-free messages.
- `fleet/evaluate-trip.ts`: `evaluateTrip` updates ETAs, recalculates an off-route trip, completes arrivals within 300 m of the requested destination, and upserts hazard alerts. Existing acknowledgements and resolutions survive repeated evaluation.
- `fleet/resolve-obsolete-alerts.ts`: `resolveObsoleteAlerts` closes open and acknowledged alerts for ended trips, inactive/deleted incidents, or incidents whose category and severity no longer pass `ALERTABLE_INCIDENTS` (an accident that aged out of its alert window). API callers pass an organization ID; the trusted cron can reconcile all organizations.
- `fleet/prune-positions.ts`: `pruneVehiclePositions` removes up to 10,000 history rows older than 30 days. Vehicle checkpoints remain available.
- `hazards/`: `projectOntoRoute`, `findHazardsAhead`, `chooseAlternativeRoute`, `estimateEta`, and `isAlertableIncident`. A buffered route bounding box rejects distant geometry before buffering individual hazards. Polygon alerts remain active while the vehicle is inside the hazard.
- `routing/osrm.ts`: `fetchRouteCandidates` requests driving alternatives with full GeoJSON geometry. Requests time out after 15 seconds; HTTP failures and unusable routes are rejected.
- `providers/`: `providerFor`, `gpsCredentialsSchema`, `geotabProvider`, and `samsaraProvider`. Geotab uses HTTPS MyGeotab hosts, follows validated federation hosts, and retries an expired session once. Samsara requires Read Vehicles and Read Vehicle Statistics permissions, uses Bearer authentication, and follows cursors with a 100-page cap per collection.
- `crypto/`: `encryptJson`, `decryptJson`, and `generateEncryptionKeyBase64` use AES-256-GCM with a fresh IV. The key is 32 bytes encoded as base64; ciphertext is `base64(iv).base64(payload)`.
- `demo-request.ts`: validation for the public demo request form.

GeoJSON coordinates are `[longitude, latitude]`; application locations are `{ lat, lng }`. Distances are meters, route durations are seconds, speeds are km/h, and dates represent UTC instants. Geotab already reports metric speed; Samsara mph is converted at the adapter boundary.

Database operations receive a request-owned Drizzle connection. They do not start transactions on the shared mysql2 connection. Keep provider credentials and raw provider/SQL errors out of logs and procedure responses.

## Verification

```sh
pnpm --filter @hack-the-andes-project/business test
pnpm --filter @hack-the-andes-project/business check-types
```

Tests use provider fixtures and the real Drizzle SQL builder with a mocked driver. They do not contact GPS accounts or run writes against MySQL.

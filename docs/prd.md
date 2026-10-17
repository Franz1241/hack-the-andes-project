# ILLAPA PRD (MVP)

*Owner: David · Status: draft for team review*

## Goal

Prove on real data that a planner can check a route, see what is risky now and in the next 24 hours, and get a recommendation they trust because every claim has a source.

## User and job

Route planner at a freight carrier or agroexporter. Before a truck leaves: is this route safe for this vehicle in this time window, and if not, what do I do?

## Core flow: Revisar ruta

1. Enter origin, destination, departure time and the vehicle's axle count. Demo trip: Lima to Huancayo.
2. ILLAPA draws the route and splits it into segments of about 5 km.
3. Each segment gets a level (Bajo, Moderado, Alto, Crítico) for Ahora and 24 h (48 and 72 h later). Its signals are labeled confirmed, forecast or baseline.
4. ILLAPA recommends Continuar, Monitorear, Retrasar or Desviar, using the rules below.
5. For Desviar, it finds the lowest-risk route on our road graph, and lists SUTRAN's official detours that allow the vehicle's axles as fallback.
6. AI writes a short explanation and preventive plan, citing each source and when it was observed.

## Recommendation rules

Rules decide. AI only explains.

| Situation on the route | Recommendation |
| --- | --- |
| Confirmed interruption | Desviar to a detour that fits the vehicle |
| Confirmed restriction | Monitorear and show the expected delay |
| Alto or Crítico forecast inside the trip window | Retrasar if a later window is lower, otherwise Desviar |
| Baseline exposure only | Continuar, with a note |
| Nothing relevant | Continuar |

## Done when

- The Lima to Huancayo check runs end to end on live data.
- Every signal shows its source and when it was observed.
- Confirmed, forecast and baseline signals look different on the map and in the list.
- Risk levels always carry a text label, never color alone.
- Detours respect the vehicle's axle limit.
- Each rule in the table has a passing test case.
- The UI is in Spanish by default, with English available.

## Demo and access

- illapa.app is a public landing page with a Probar demo button.
- The button calls a public auth endpoint that signs the visitor into one shared demo account, so judges never type a password.
- An En vivo / Escenario toggle switches between live data and a replay of a real past rain event on the Lima to Huancayo trip.
- Reset the demo account's data before the pitch.
- The real app uses the existing better-auth email and password login: individual accounts, no organizations or roles.

## If time, in this order

1. Map layer of emergency and supply points: police, fire, health, bus terminals, weigh stations and INDECI warehouses. Already scraped.
2. Saved routes, with an alert when a route's level changes.
3. Incident feed that shows confidence, from unverified news to official confirmation.
4. Dispatcher dashboard for several trips at once.
5. WhatsApp or email alerts.

## Out of scope

GPS and fleet integrations, AR/XR simulations, organizations and roles, and demo corridors beyond Lima to Huancayo.

## Open questions

- Which past rain event on the Lima to Huancayo trip the Escenario mode replays.
- Score thresholds for the four levels, set after the backtest.

# ILLAPA data sources and risk score

*Snapshot: 17 Oct 2026 · Scraper code: [apps/scraper](../apps/scraper)*

## Summary

- **Reactive:** SUTRAN is the fastest official signal and MTC/Provías adds km-level detail. INDECI confirms. News is an early, unverified hint.
- **Predictive:** SENAMHI (observed and forecast rain) and CENEPRED (risk scenarios), checked against MTC's history of road emergencies.
- Every record keeps its source and timestamps, so the app can say who reported what and when.

## What we ingest

| Source | What we take | Refresh | Trust | Status |
| --- | --- | --- | --- | --- |
| SUTRAN road alerts | Closures and restrictions by road and km | 5 min | Very high | Live |
| SUTRAN alternative routes | Official detours with geometry and axle limits | Daily | Very high | Live |
| INDECI COEN | Confirmed emergencies with coordinates and hazard type | 5 min | Very high, slower | Live |
| SENAMHI warnings | Rain, quebrada and hydrological warning areas | 5 min | Very high | Live |
| Bomberos Perú | Emergencies in the last 24 h | 5 min | High | Live |
| RPP news, classified by Jev | Possible road incidents before agencies report them | Hourly | Medium | Live |
| Points of interest | Police, fire, health, bus terminals, weigh stations, INDECI warehouses | Daily | High | Live |
| MTC/Provías emergencies | Live road emergencies with route and km | 5 min | Very high | To add |
| SENAMHI observations and forecast | Hourly station rain and short-term forecast | Hourly | Very high | To add |
| CENEPRED scenarios | Landslide and flood risk areas for the current forecast | 30 to 60 min | High | To add |
| MTC emergencies dataset | Jan to Aug 2026 history with type, road, km and coordinates | Weekly, stale since 25 Aug | Very high | To add |

Not in the MVP: ANA hydrometric stations, MINAM environmental layers, OSITRAN statistics, Waze for Cities (needs a partnership) and Google News.

Also to add, from the predictive model: INGEMMET landslide susceptibility maps, Open-Meteo forecast and history (the history feeds the backtest), and OpenStreetMap roads for the routing graph.

## Confidence ladder

Unverified news → corroborated by a second source → confirmed by SUTRAN, MTC, INDECI or COER → restricted or interrupted → resolved.

The UI says which step a report is on. For example, "Possible huaico near PE-22, not confirmed yet" versus "MTC reports PE-22 interrupted at km 138. Reroute."

## Risk score

One score per segment and time window (Ahora, 24 h, 48 h and 72 h):

`risk = 0.35 forecast rain + 0.25 landslide susceptibility + 0.20 incident history + 0.10 river and flood exposure + 0.10 observed rain`

- Weights are a starting point. We check them against MTC's past emergencies: segments that score high should have had more incidents.
- A pooled LightGBM model, trained offline on all 2026 MTC routes in 3-day windows and validated on routes it never saw, replaces the weights only if it beats them on those routes.
- The score maps to Bajo, Moderado, Alto and Crítico (verde, amarillo, naranja, rojo, as in SENAMHI warnings). Thresholds come from that check.
- Confirmed disruptions are not part of the score. They override it through the [rules table in the PRD](prd.md#recommendation-rules).

## Data rules

- Store observed_at, published_at, source_updated_at and ingested_at on every record, so we can show and measure freshness.
- Judge freshness by the latest record's date, never by a layer's name.
- Keep the source on every signal, so each recommendation can cite it.
- A failed fetch never deactivates data. The scraper already works this way.

## Known gaps from the 17 Oct check

- SUTRAN detour text has no road codes for the Carretera Central. Match alerts to detours by corridor or distance to the line, not by road code.
- SUTRAN stores some detours as many pieces (Ruta 3 has 120). Group them by corridor and name before listing.
- In the detour feed, interrumpido marks the stretch a detour avoids, not a live closure.
- MTC's dataset is one season (1 Jan to 20 Aug 2026) and hasn't updated since 25 Aug. About 5,000 earlier records exist (report IDs start at VIALES-005093): ask MTC for them.
- PE-22's 2026 emergencies are mostly accidents (36 of 57), with only 7 rain-related segment-days, so the model trains on all routes pooled. PE-3N, PE-5N and PE-5NA have the most labels.
- Event dates are often report dates and weekends are under-reported, so labels use 3-day windows.

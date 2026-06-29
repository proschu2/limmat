# Limmat Böötle Guide — Data Specification

> **Resumability note:** This document is the single source of truth for *what the app computes and why*. It was reverse-engineered from the original Flutter app (`lib/services/api_service.dart`, `lib/models/water_data.dart`) and Cloud Functions (`functions/src/index.ts`). If a session is interrupted, rebuild the data layer from this file — nothing else is needed.

## Purpose

Help people in Zurich decide whether to **Böötle** (float downriver in an inflatable) on the **Limmat**. Shows live river conditions + a multi-day forecast, each metric colored by safety.

## Upstream data sources

| Data | Source URL | Station |
|---|---|---|
| Water height (Δ) forecast | `https://www.hydrodaten.admin.ch/plots/p_forecast/2099_p_forecast_de.json` | 2099 |
| Flow speed forecast (discharge) | `https://www.hydrodaten.admin.ch/plots/q_forecast/2099_q_forecast_de.json` | 2099 |
| Current height + speed (last 7 days) | `https://www.hydrodaten.admin.ch/plots/p_q_7days/2099_p_q_7days_en.json` | 2099 |
| Water temperature (last 7 days) | `https://www.hydrodaten.admin.ch/plots/temperature_7days/2243_temperature_7days_en.json` | **2243** |
| Weather (air temp + weather code, daily forecast) | `https://api.open-meteo.com/v1/forecast?latitude=47.392574&longitude=8.520825&current=temperature_2m,weather_code&daily=weather_code` | Zurich coords |

- CORS: **open-meteo allows browser calls** (`access-control-allow-origin: *`). **hydrodaten sends NO CORS headers** → must be proxied server-side.
- Coordinates: `lat=47.392574, lon=8.520825` (Zurich).

## Parsing logic (must be replicated exactly)

### Data shape
Each hydrodaten response is:
```json
{ "plot": { "data": [ { "name": "...", "x": [...dates...], "y": [...values...] }, ... ] } }
```

### Datum offset (CRITICAL constant)
Station 2099 reports water level in **meters above sea level (m a.s.l.)**, ~`400.35 m`. The app shows the **Δ (deviation)** from this datum:
```
deltaHeight_m = raw_value - 400.35
```
**`DATUM_M = 400.35`** — name this constant everywhere. It appears 6× in the old code with no comment.

### Forecast series — take the "Median" trace
For `p_forecast` / `q_forecast`: the `data` array has multiple named traces; pick `element.name === "Median"`.
- **Height forecast**: `y.map(v => v - 400.35)`, round to 2 decimals (i.e. `Math.round(v*100)/100`).
- **Speed forecast**: `y.map(v => Math.round(v))`, integer.

### Per-day averaging
Forecasts have multiple values per day (timestamps). Bucket by calendar date (`YYYY-MM-DD`) and average:
```
for each (dateString, value):
    dateKey = parse(dateString).format("YYYY-MM-DD")   // ⚠️ timezone — see note
    accumulate sum + count per dateKey
average[date] = round ? Math.round(sum/count) : Math.round(sum/count * 100)/100
return sorted by date ascending
```
⚠️ **Timezone bug in old code (MUST FIX):** Dart version parsed dates in **local time**, TypeScript version used `toISOString()` (**UTC**). Same data → different date buckets → web/mobile disagreed. **Standardize on Europe/Zurich local date** (the data is about Zurich). Use `Intl.DateTimeFormat` or parse + shift by the site's timezone.

### Current conditions (from `p_q_7days`)
The 7-day file has two named traces:
- `"Water level"` → take **last** value, apply datum offset `(v - 400.35)`, round 2 decimals → `waterHeight`
- `"Discharge"` → take **last** value, `Math.round` → `waterSpeed` (m³/s)

### Temperature (from `temperature_7days` 2243)
`data[0].y` → take **last** value, `Math.round(v*10)/10` → 1 decimal → `waterTemperature`

### Weather (from open-meteo)
- `current.temperature_2m` → `outsideTemperature`
- `current.weather_code` → current `weatherCode`
- `daily.time[]` + `daily.weather_code[]` → forecast `weatherCode` per date

### WMO weather codes → icon mapping (open-meteo)
0–3 sunny/overcast · 45,48 fog · 51–57,61–67,80–82 rain · 71–77,85–86 snow · 95–99 thunderstorm. (Full table in old `water_data.dart`.)

## Safety thresholds (the core "can I go?" logic) — DO NOT CHANGE without intent

**Δ Water height (m):**
- 🔴 Danger: `≤ -0.24` **or** `≥ 0.79`
- 🟡 Caution: `≤ 0.10` **or** `≥ 0.45`
- 🟢 Safe: otherwise

**Flow speed (m³/s):**
- 🔴 Danger: `≤ 60` **or** `≥ 165`
- 🟡 Caution: `≤ 85` **or** `≥ 145`
- 🟢 Safe: otherwise

**Weather code:**
- 🔴 `≥ 50` (rain/snow/storm)
- 🟡 `≥ 40` (fog)
- 🟢 `< 40`

> Rationale (inferred): too low = scraping bottom / stagnant; too high = dangerous current. Both extremes are unsafe. These are the values the original author chose; treat as domain truth unless a hydrologist says otherwise.

## Caching strategy

- Cache fetched+parsed results for **30 minutes** (polite to the Swiss federal API, fast reloads).
- Old code: Firestore doc `latest` with `updatedAt` server timestamp; client also cached in `SharedPreferences` for 30 min.
- New code: Cloudflare Worker `Cache API` with `max-age=1800` (simpler, edge-native, no DB).

## Units summary

| Field | Unit | Notes |
|---|---|---|
| waterHeight | m | Δ from 400.35 m datum (can be negative) |
| waterSpeed | m³/s | discharge, integer |
| waterTemperature | °C | 1 decimal |
| outsideTemperature | °C | air, from open-meteo |
| weatherCode | — | WMO code |

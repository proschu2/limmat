# Limmat Böötle Guide 🌊

> **Should I float down the Limmat today?**
> Live river conditions + 7-day forecast for Böötling in Zurich.
>
> 🔗 **[lbg.sanziomonti.com](https://lbg.sanziomonti.com)**

A lean single-page web app that tells Zurich locals — at a glance — whether it's
safe and pleasant to **Böötle** (float downriver in an inflatable) on the Limmat.
Each metric (water level, flow, weather) is rated safe / caution / danger, and
the hero badge explains *why*.

## What it shows

- **Hero safety badge** — overall go/caution/no-go, with the reason (e.g. *"level
  too low"*). Tap for the exact thresholds.
- **Current conditions** — air temp, water temp, flow (m³/s), level (Δm).
- **7-day forecast** — table (with a per-day **"Böötle?"** grade) + dual-axis chart
  with weather icons under each day.
- **Light / dark** theme + **English / German** toggle. All WCAG-AA, colorblind-safe.

## Data sources

| Data | Source |
|---|---|
| Water level (Δ), flow speed, status | [hydrodaten.admin.ch](https://www.hydrodaten.admin.ch) — station **2099** (Limmat) |
| Water temperature | hydrodaten.admin.ch — station **2243** |
| Weather (air temp, codes, forecast) | [open-meteo.com](https://open-meteo.com) |

`hydrodaten` sends no CORS headers, so it's proxied server-side by the Pages
Functions in `functions/` with a 30-min edge cache. Open-Meteo is called
directly from the browser (CORS-allowed).

## Tech stack

- **React 19 + Vite 8 + TypeScript 6** — tiny SPA (~170 KB gzipped)
- **Cloudflare Pages + Pages Functions** — static site and `/api/*` proxy deploy
  together as one project (free tier, no credit card)
- **Recharts 3** — forecast chart · **Lucide** — weather icons
- **Bun** — package manager

See [`docs/DATA_SPEC.md`](docs/DATA_SPEC.md) for the parsing logic & safety
thresholds, [`docs/DESIGN_BRIEF.md`](docs/DESIGN_BRIEF.md) for the design system.

## Develop

```bash
bun install
bun run dev        # wrangler pages dev -- vite → http://localhost:8787
                   #   (serves the UI + /api/* functions together)
```

| Script | What it does |
|---|---|
| `bun run dev` | Local full-stack dev (Vite HMR + Functions) |
| `bun run build` | Typecheck + production build to `dist/` |
| `bun run preview` | Serve the built `dist/` with Functions |
| `bun run typecheck` | Typecheck app + functions |

## Deploy (Cloudflare Pages)

1. **Connect this repo** in the Cloudflare dashboard → Workers & Pages → Pages.
2. Build settings: **build command** `bun install && bun run build`,
   **output directory** `dist` (root directory: empty).
3. **Custom domain** → add `lbg.sanziomonti.com`.
4. Every `git push` auto-redeploys.

Regenerate icons / social card (after an icon change):

```bash
NODE_PATH=$(node -e "console.log(require.resolve('playwright').replace(/node_modules.*$/,''))") \
  bun run .gen-icons.mjs   # writes PNGs to public/
```

## Project structure

```
.
├── functions/          Pages Functions (CORS proxy + cache, parsing logic)
│   ├── _lib/           types, parse.ts (single source of truth), http.ts
│   └── api/            current.ts, forecast.ts, health.ts
├── public/             favicon, PWA icons, manifest, og-image
├── src/
│   ├── components/     Header, SafetyBadge, ConditionsGrid, ForecastChart, …
│   ├── lib/            api, safety thresholds, i18n (en/de), format, types
│   ├── theme/          design tokens (light/dark)
│   └── styles.css
├── docs/               DATA_SPEC, DESIGN_BRIEF, UX_CRITIQUE
├── index.html          full OpenGraph + PWA meta
└── wrangler.toml
```

## License

MIT.

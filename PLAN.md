# PLAN.md — Limmat Böötle Guide Web Rewrite

> **🔍 READ THIS FIRST IF RESUMING.** This is the master plan and checkpoint log. It survives session restarts. Always read this file + `docs/DATA_SPEC.md` + `docs/DESIGN_BRIEF.md` before continuing. Update the checklist as work progresses.

**Branch:** `web-rewrite` (created from `main` at commit `4309d48`)
**Started:** 2026-06-29
**Last updated:** 2026-06-29

---

## 🎯 Goal

Rewrite the Limmat Böötle Guide from Flutter (mobile+web) to a **lean TypeScript website** on **Cloudflare (Pages + Workers)**. Free forever, no credit card, fast loads. Same information, nicer/accessible UI, better contrast.

- **Domain:** `lbg.sanziomonti.com` (Cloudflare — user has account, hosts multiple Pages)
- **Audience:** Zurich locals checking if it's safe to float the Limmat, mostly on phones, quick glance
- **Stack:** Cloudflare Pages (static site) + Cloudflare Worker (CORS proxy + cache). No Firebase in the final product.

---

## ✅ Locked decisions (do not re-litigate)

| # | Decision | Rationale |
|---|---|---|
| 1 | Drop Android/iOS/macOS native, Flutter-web, the syncfusion fork, the PPGatwick font | No native targets wanted; Flutter-web is bloated for this size app |
| 2 | **Cloudflare Pages + Pages Functions** (single project), not separate Worker + Pages | One deploy, one domain, no route binding; user already knows Pages. *(Consolidated from the original two-project plan mid-build.)* |
| 3 | Firebase project `limmat-boeoettle-guide` left untouched (functions keep running, can be deleted later) | Nothing destroyed; safe rollback |
| 4 | TS site (React + Vite + TypeScript) | User asked for TS/JS; React+Vite is the default, fast, small |
| 5 | Charting: Recharts (React) or Apache ECharts | Dual-axis spline + markers; both free |
| 6 | Fonts: **Inter** (body/data) + **Manrope** (display), both OFL | Replaces unlicensed PPGatwick |
| 7 | Light mode default + dark mode toggle | Fixes old contrast problems; both WCAG AA |
| 8 | Safety indicators quadruple-encoded (shape + icon + label + color) | Colorblind-safe |
| 9 | Parsing logic lives ONCE in the Worker (shared type) | Kills the 150-line Dart/TS duplication + timezone bug |
| 10 | **Timezone fix:** bucket forecast dates by `Europe/Zurich` local date | Old code drifted (local vs UTC); this standardizes |
| 11 | 30-min edge cache via Cloudflare Cache API | Replaces Firestore "latest" doc |
| 12 | UI default English with **German (de) toggle** (UI control in header, persists to localStorage) | Audience is Zurich locals; user explicitly requested EN/DE switch |
| 13 | New app icon — **later**, not in this rewrite | User will handle separately |
| 14 | **Bun** as package manager (not npm/yarn) | Faster installs, single clean lockfile, native to 2026; user approved |

---

## 📐 Architecture

```
Browser (lbg.sanziomonti.com — Cloudflare Pages, React+Vite+TS)
  ├── weather  → api.open-meteo.com        [CORS-allowed: direct browser fetch]
  └── river    → /api/limmat Worker          [same origin; CF handles routing]
                   └── fetch hydrodaten.admin.ch  [server-side, no CORS]
                       + Cache API 30-min TTL
                       + returns parsed JSON (single source of truth)
```

**Why a Worker at all:** `hydrodaten.admin.ch` sends zero CORS headers → browser cannot call it directly. The Worker proxies server-side (CORS is browser-only) and adds a 30-min cache.

**Repo structure (target):**
```
/
├── docs/                    # DATA_SPEC.md, DESIGN_BRIEF.md, PLAN.md  (keep)
├── site/                    # React + Vite + TS app (Cloudflare Pages root)
│   ├── src/
│   │   ├── components/      # SafetyBadge, ConditionsGrid, ForecastChart, ForecastTable, Header
│   │   ├── lib/             # api.ts, types.ts, weather-codes.ts, safety.ts, format.ts
│   │   ├── theme/           # tokens.css, fonts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/              # favicon, manifest, icons (placeholder until new icon)
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── worker/                  # Cloudflare Worker (CORS proxy + cache + parsing)
│   ├── src/
│   │   ├── index.ts         # fetch handler, CORS, cache
│   │   ├── parse.ts         # parsing logic (DATUM_M=400.35, Median trace, averaging)
│   │   ├── safety.ts        # thresholds (shared conceptually with site)
│   │   └── types.ts
│   ├── wrangler.toml
│   ├── package.json
│   └── tsconfig.json
├── README.md                # rewrite (current one is default Flutter template)
├── LICENSE                  # add (MIT or similar)
└── (delete: android/ ios/ macos/ windows/ linux/ lib/ functions/ pubspec.* web/ test/ assets/ fonts/ .github/workflows/old ...)
```

---

## 🎨 Design tokens (from DESIGN_BRIEF.md — quick ref)

```css
/* Light */ --bg:#F0F7FA --card:#FFF --text:#0D2137 --text2:#5A6B7E --water:#0077B6 --safe:#1E7D3A --caution:#B85200 --danger:#B81A1A
/* Dark  */ --bg:#0A1628 --card:#14233A --text:#E8EFF6 --text2:#8B9DB0 --water:#48CAE4 --safe:#4ADE80 --caution:#FBBF24 --danger:#FB7171
/* Fonts */ display:Manrope  body:Inter
/* Chart  */ speed line cyan #00B4D8 (solid)  height line amber #F59E0B (dashed)
```

---

## 📋 Phased checklist (update ✅ as completed)

### Phase 0 — Setup & scaffolding
- [x] 0.1 Create `site/` (Vite React-TS) and `worker/` dirs
- [x] 0.2 `site/` package.json, vite.config.ts, tsconfig, index.html shell
- [x] 0.3 `worker/` wrangler.toml, package.json, tsconfig
- [x] 0.4 Design tokens CSS (`site/src/theme/tokens.css`) — light + dark via `[data-theme]`
- [ ] 0.5 Font loading (Inter + Manrope variable, self-hosted or Google Fonts) — *system fallback in place, self-host TODO*
- [x] 0.6 Local dev runs: site builds + worker parses live data

### Phase 1 — Worker: data layer (single source of truth)
- [x] 1.1 `worker/src/types.ts` — `WaterData`, `ForecastedWaterData` (mirror `docs/DATA_SPEC.md`)
- [x] 1.2 `worker/src/parse.ts` — `DATUM_M=400.35`, Median-trace extraction, per-day averaging (Europe/Zurich), current conditions from `p_q_7days`, temperature from station 2243  ✅ **validated against live hydrodaten**
- [x] 1.3 `worker/src/safety.ts` — thresholds (height/speed/weather → safe/caution/danger)
- [x] 1.4 `worker/src/index.ts` — fetch handler: routes (`/api/current`, `/api/forecast`), CORS headers, 30-min Cache API, OPTIONS preflight, error handling + 5xx fallback
- [x] 1.5 Weather from open-meteo fetched browser-side (CORS-ok) — decided per PLAN
- [ ] 1.6 Test worker locally with `wrangler dev` — *parsing validated via Bun instead; full HTTP roundtrip pending deploy*
- [ ] 1.7 Deploy worker to Cloudflare (user runs deploy cmd with their account)

### Phase 2 — Site: data + state
- [x] 2.1 `site/src/lib/types.ts` — shared types (match worker output)
- [x] 2.2 `site/src/lib/safety.ts` — same thresholds
- [x] 2.3 `site/src/lib/weather-codes.ts` — WMO code → icon/label map (en/de)
- [x] 2.4 `site/src/lib/api.ts` — fetch `/api/current` + `/api/forecast` + weather, 30-min client cache, error states
- [x] 2.5 `site/src/lib/format.ts` — number/date formatting (Intl, de/en)
- [x] 2.6 `site/src/lib/i18n.ts` — en + de string dictionary
- [x] 2.7 `site/src/lib/useSettings.ts` — theme + lang context, persisted

### Phase 3 — Site: UI components
- [x] 3.1 `Header` — title + dark toggle + EN/DE toggle
- [x] 3.2 `SafetyBadge` — hero, overall status, quadruple-encoded, `role="status"`, tappable → criteria modal
- [x] 3.3 `ConditionsGrid` — 2×2 cards (air temp, water temp, speed, Δheight) with safety dots
- [x] 3.4 `ForecastChart` — dual-axis (Recharts 3), solid speed (cyan) + dashed height (amber), tooltips
- [x] 3.5 `ForecastTable` — Day/Speed/ΔH/Weather, color-coded
- [x] 3.6 `Tabs` segmented control
- [x] 3.7 Loading + error/retry states
- [x] 3.8 Accessibility: ARIA labels, focus rings, aria-live, 44px touch targets, reduced-motion
- [x] 3.9 **Site typechecks + production build passes** (168KB gzip)

### Phase 4 — Polish & deploy
- [ ] 4.1 Light + dark visual QA; verify contrast ratios in browser
- [ ] 4.2 Responsive: mobile-first, check 320/375/768/1024 widths
- [ ] 4.3 PWA basics: manifest, theme-color, favicon (placeholder icon OK)
- [ ] 4.4 Lighthouse pass (perf/a11y/SEO); aim 90+ everywhere
- [ ] 4.5 Cloudflare Pages deploy wired (connect repo, build = `npm run build`, output `site/dist`)
- [ ] 4.6 Custom domain `lbg.sanziomonti.com` attached to Pages
- [ ] 4.7 Worker route bound to the Pages domain (`/api/*`)
- [ ] 4.8 Smoke test live site end-to-end

### Phase 5 — Cleanup
- [ ] 5.1 Delete `android/ ios/ macos/ windows/ linux/ lib/ functions/ pubspec.yaml pubspec.lock test/ assets/ fonts/ .metadata analysis_options.yaml firestore.* .firebaserc` and old `web/`
- [ ] 5.2 Remove old Flutter CI workflow; add Cloudflare Pages deploy (auto via CF git integration, or GitHub Action)
- [ ] 5.3 Rewrite README (setup, env, deploy, data sources)
- [ ] 5.4 Add LICENSE
- [ ] 5.5 (Optional, user-driven) delete Firebase project `limmat-boeoettle-guide` once DNS stable
- [ ] 5.6 (Later) new app icon — out of scope here
- [ ] 5.7 Merge `web-rewrite` → `main`

---

## ⏸️ Current checkpoint

**Status**Status:** Phases 0–3 complete. Site builds, worker parses live data.
**Next action:** Phase 4 (local full-stack preview, then deploy to Cloudflare). User needs to run deploy with their CF account.
**Blockers:** None. **Package manager: bun** (1.3.13, faster, single lockfile). Deps verified latest + compatible: TS 6, Vite 8, React 19, Recharts 3, Wrangler 4, @cloudflare/workers-types 4.20260629. Both `worker/` and `site/` install + typecheck clean. For Worker local test: `cd worker && bun run dev` (wrangler). For deploy: user runs `bun run deploy` logged into CF.

## 🔁 How to resume (for any future session)
1. Read `PLAN.md` (this file) — check Current checkpoint + checklist.
2. Read `docs/DATA_SPEC.md` — rebuild the data layer from this.
3. Read `docs/DESIGN_BRIEF.md` — colors/fonts/layout.
4. `git branch --show-current` should be `web-rewrite`.
5. Resume at the first unchecked item.

## 📝 Open questions (resolve when encountered)
- Worker route: separate `*.workers.dev` subdomain, or `/api/*` bound to the Pages domain? (Prefer `/api/*` on `lbg.sanziomonti.com` — same-origin, cleaner.) — resolved: prefer /api/*
- Recharts vs ECharts: pick Recharts (React-native, smaller for our needs) unless dual-axis ergonomics push to ECharts.
- Weather via worker or direct browser fetch? Lean worker (uniform caching/error handling) but direct fetch is cheaper/simpler. — lean: weather direct from browser (CORS-allowed), river via worker.
- i18n: hardcode en + de strings in a single `src/lib/i18n.ts` dictionary, toggle via React context, persists to localStorage. No i18next dependency for v1 (only 2 languages). — resolved

## 🧰 Local tooling status (machine)
- Node 22 ✅ · npm 10 ✅
- Flutter/Dart ❌ (not needed for rewrite)
- wrangler (CF CLI) — to install when deploying
- Chrome ❌ (for headless Lighthouse later; not blocking)

# PLAN.md — Limmat Böötle Guide

> **Status: build complete, pending Cloudflare deploy.**
> Read this + `docs/DATA_SPEC.md` + `docs/DESIGN_BRIEF.md` to resume.

## Goal

A lean TypeScript single-page web app — **Limmat Böötle Guide** — that tells
Zurich locals at a glance whether to Böötle (float) the Limmat today. Replaced
the old Flutter app. Free hosting on Cloudflare.

- **Domain:** `lbg.sanziomonti.com`
- **Stack:** React 19 + Vite 8 + TypeScript 6 · Cloudflare **Pages + Pages
  Functions** (one project) · Bun · Recharts · Lucide
- **Fallback:** `main` branch holds the original Flutter project at `4309d48`

## Branches
- `web-rewrite` — the new web app (current work)
- `main` — legacy Flutter (untouched fallback)

## Completed
- [x] Rewrite Flutter → React/TS SPA
- [x] Pages Functions (CORS proxy + 30-min cache); parsing logic in one place
  (`functions/_lib/parse.ts`) — fixes old Dart/TS duplication + timezone bug
  (now `Europe/Zurich`)
- [x] WCAG-AA light/dark, colorblind-safe safety states, EN/DE
- [x] UX critique (see `docs/UX_CRITIQUE.md`) — all findings fixed: badge
  contrast, 44px tap targets, badge now states the failing metric, per-day
  "Böötle?" grade column, tiered spacing, heading landmarks
- [x] Weather icons in chart axis (Lucide), table as default tab
- [x] German wording fixed (Pegel→Wasserstand, Abfluss→Strömung)
- [x] Deleted Flutter app + Firebase backend (kept on `main`)
- [x] Flattened `site/` → repo root (single product, no nesting)
- [x] Valid PWA: real PNG icons + manifest (maskable + any + SVG)
- [x] Full OpenGraph + Twitter card + Apple PWA meta; generated og:image
- [x] README rewritten; gitignore cleaned

## Pending (deploy)
- [ ] Push `web-rewrite` to GitHub
- [ ] Cloudflare Pages: connect repo, build cmd `bun install && bun run build`,
      output `dist`
- [ ] Custom domain `lbg.sanziomonti.com`
- [ ] Smoke test live (incl. `/api/current`, og:image, manifest)
- [ ] (Optional) new app icon — out of current scope; rerun `.gen-icons.mjs` after

## Local dev
```bash
bun install
bun run dev          # wrangler pages dev -- vite → :8787 (UI + /api/*)
bun run typecheck    # app + functions
bun run build        # → dist/
```
Running as systemd user unit `limmat-pages` on this box (Tailscale:
`http://mediateca.lamb-burbot.ts.net:8787`). Regenerate icons:
`NODE_PATH=<playwright dir> bun run .gen-icons.mjs`.

## Open questions
- og:image is rasterized from HTML via Playwright — fine for now; a designer
  icon + hand-tuned card could replace it later.
- Recharts bundle (~170 KB gzip) — acceptable; could code-split the chart if
  first-paint perf becomes a concern.

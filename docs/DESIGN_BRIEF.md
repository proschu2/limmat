# Design Brief — Limmat Böötle Guide (LBG)

> Captured from UX research. Implementation reference for colors, typography, layout, and accessibility.

## Goal
Mobile-first, glanceable single-page web app. Tells Zurich locals whether it's safe & pleasant to float down the Limmat in an inflatable ("Böötle"). Fixes the old app's poor-contrast blue-on-blue gradient. Fresh "water" aesthetic, WCAG AA compliant. Green/yellow/red safety indicators must work **without relying on color alone** (colorblind-safe).

---

## 1. Color System

**Philosophy:** Drop the full-screen blue gradient. Clean airy **light mode** (ice-water tinted white) as default, **deep navy dark mode** opt-in. Narrow blue accent gradient on header/status card retains the water feel without harming contrast.

### Light Mode
| Role | Hex | Contrast vs bg |
|---|---|---|
| Page background | `#F0F7FA` | — |
| Card/surface | `#FFFFFF` | — |
| Primary text | `#0D2137` | **12.1:1** |
| Secondary text | `#5A6B7E` | **4.7:1** |
| Divider/border | `#DCE5ED` | decorative |
| Water accent | `#0077B6` | **6.7:1** |
| Water accent light | `#90E0EF` | decorative |
| Safe (green) | `#1E7D3A` | **7.5:1** on white |
| Caution (amber) | `#B85200` | **4.6:1** on white |
| Danger (red) | `#B81A1A` | **7.3:1** on white |

### Dark Mode
| Role | Hex | Contrast vs bg |
|---|---|---|
| Page background | `#0A1628` | — |
| Card/surface | `#14233A` | — |
| Primary text | `#E8EFF6` | **12.8:1** |
| Secondary text | `#8B9DB0` | **4.7:1** |
| Divider/border | `#2A3D55` | decorative |
| Water accent | `#48CAE4` | **6.9:1** |
| Safe (green) | `#4ADE80` | **8.1:1** |
| Caution (amber) | `#FBBF24` | **11.2:1** |
| Danger (red) | `#FB7171` | **8.3:1** |

### Safety indicator — quadruple-encoded (colorblind safe)
`[✓] Safe` green circle + checkmark · `[!] Caution` amber triangle + `!` · `[✗] Danger` red diamond + `X`. Always include the text label. Never color-only.

### Background accent
Subtle top-to-bottom fade from `#0077B6` (10% opacity) at top → transparent. Water association without contrast harm.

---

## 2. Typography (all libre/OFL, replaces unlicensed PPGatwick)

| Role | Font | Weights |
|---|---|---|
| Display/headings | **Manrope** | 700, 600 |
| Body/data | **Inter** | 400, 500, 600, 700 (variable) |

Fallback: `Inter, Manrope, system-ui, -apple-system, sans-serif`. Use `rem` units.

### Type scale (mobile-first)
| Element | Size | Weight |
|---|---|---|
| Site title | 22px | 700 Manrope |
| Safety badge label | 16px | 700 |
| Large data value | 28px | 700 |
| Data unit | 13px | 500 |
| Data label | 12px | 600 (uppercase) |
| Chart axis labels | 11px | 400 |
| Table header | 12px | 600 (uppercase) |
| Table values | 14px | 500 |

---

## 3. Layout (mobile-first)

### Above the fold — answers "Can I go?" instantly
```
┌─────────────────────────────┐
│  ☰ LBG                  🌓  │  header (name + dark toggle)
├─────────────────────────────┤
│  ┌─────────────────────────┐│
│  │   ✓ S A F E             ││  full-width safety badge (hero)
│  │   Good to float today   ││
│  └─────────────────────────┘│
├─────────────────────────────┤
│  ┌──────┐  ┌──────┐         │
│  │☀ 23° │  │💧 17°│         │  2×2 current-conditions grid
│  │ Air  │  │Water │         │  each = icon + big value + label
│  └──────┘  └──────┘         │  + safety dot in corner
│  ┌──────┐  ┌──────┐         │
│  │ 140  │  │+0.05 │         │
│  │ m³/s │  │  Δm  │         │
│  └──────┘  └──────┘         │
├─────────────────────────────┤
│  [Chart tab] [Table tab]    │  segmented control
└─────────────────────────────┘
```

### Below the fold
- **Chart tab:** dual-axis spline, ≥280px height, solid speed line + dashed height line, tappable tooltips.
- **Table tab:** Day / Speed / ΔH / Weather, color-coded, horizontally scrollable.

### Chart legibility rules
Min 280px height · dual axis colored to match its line · solid vs dashed + different markers (colorblind-safe) · abbreviate to weekday (Mon) · tappable markers → dark tooltip with white text · 16px side padding.

---

## 4. Reference patterns
- **Apple Weather** — hero current-condition number, strict hierarchy current→today→week.
- **OnTheSnow / ski resort** — overall status badge as hero → detail metrics. Maps 1:1 to LBG.
- **PurpleAir AQI** — colored dot on neutral card for safety indicators; large centered numbers with tiny units.

---

## 5. Accessibility & motion
- **Colorblind safety (critical):** shape (circle/triangle/diamond) + icon (✓/!/✗) + label (Safe/Caution/Danger) + position consistency. Chart: solid vs dashed + different markers + hatched/filled danger zones (not color tint alone).
- **Contrust:** all text ≥4.5:1, large ≥3:1 (validated above).
- **Touch targets:** ≥44×44px for all interactive elements.
- **Motion:** respect `prefers-reduced-motion`; skeleton shimmer (not spinner) on load; 200-300ms theme transition; ~400ms chart draw (skip if reduced-motion). No auto-scroll/carousels.
- **ARIA:** every icon/chart element labeled; safety badge `role="status"`; data container `aria-live="polite"`.
- **Focus:** 2px outline + 2px offset.
- **Font:** `rem` units throughout.

## Chart line colors (proposal)
Speed line: cyan/teal `#00B4D8`. Height line: amber `#F59E0B`. Distinguishable from safety colors and each other.

# Research: UX/Accessibility Critique — Limmat Böötle Guide

## Summary
The app is structurally sound but has 4 WCAG AA failures (badge contrast in dark mode, inactive tab contrast in both modes, undersized tab touch targets) and a critical glanceability gap: the hero badge signals "Danger" without revealing WHICH metric caused it. The uniform 16px vertical rhythm flattens the information hierarchy, making the page feel monotonous despite good data density. Seven concrete fixes would bring it to AA compliance and greatly improve glanceability.

---

## Findings

### CRITICAL — WCAG AA Failures

1. **Dark mode badge contrast: 2.73:1 (FAILS WCAG AA, needs 4.5:1)**
   - **Measured:** White text (`#fff`) on danger red (`#fb7171`) — the ✕ icon (28px), "Danger" (16px), and "Better not today" (13px) all fail. [Source: audit.json mobile-dark-en lowContrastText entries for ✕, Danger, Better not today]
   - **Root cause:** The design brief's contrast table (§1.3) lists `#FB7171` as "8.3:1 vs bg" — but that's against the page background `#0A1628`, not against the **white text overlaid on the badge**. The actual use case (white text on filled danger badge) was never validated.
   - **Fix:** Change `--danger` in dark mode from `#FB7171` to `#C03535` (RGB 192, 53, 53). This gives 5.5:1 against white text while remaining visually red on the dark card background. Alternatively, switch badge text to the dark primary color `#0D2137` (gives ~6.4:1), but that breaks the convention of white text on all badge states.
   - **CSS change:** In `tokens.css`, `[data-theme="dark"] { --danger: #C03535; }`

2. **Inactive tab "Table" text: 4.29:1 light / 3.98:1 dark (FAILS WCAG AA, needs 4.5:1)**
   - **Measured:** Light mode: `#5A6B7E` on `#DCE5ED` = 4.29:1. Dark mode: `#8B9DB0` on `#2A3D55` = 3.98:1. [Source: audit.json lowContrastText both themes]
   - **Root cause:** The tab background is `var(--divider)` which is the light blue-gray/ dark navy-border. The `--text-secondary` color, designed for 4.7:1 against the page background, is only ~4.3:1 against the divider tone.
   - **Fix:** In light mode, darken inactive tab text to `#3A4C60` (calculated luminance ≤0.131 for ≥4.5:1 on `#DCE5ED`). In dark mode, lighten inactive tab text to `#A8BCCF` (calculated luminance ≥0.377 for ≥4.5:1 on `#2A3D55`).
   - **CSS change:** Add `.tab { color: #3A4C60; }` under light and `.tab { color: #A8BCCF; }` under dark. Or add a dedicated `--tab-inactive` token.

3. **Tab touch targets: 41px tall (FAILS WCAG 2.5.8, needs ≥44px)**
   - **Measured:** Both "Chart" and "Table" tabs measure 175×41px on mobile. Desktop is 300×41px. [Source: audit.json smallTapTargets]
   - **Fix:** Increase tab padding from `padding: 10px` to `padding: 11px 10px`. This gives 41+2=43px... still short. Use `padding: 12px 10px` for 45px total (tab vertical padding 4px + 12px pad + ~22px text + 12px pad = 50px tab container at 4px padding... actually the tab itself is 10px padding, so 10+content+10 = 41. Need 44: (44-21)/2 = 11.5 → use `padding: 12px 10px`).
   - **CSS change:** `.tab { padding: 12px 10px; }` — but verify container height accommodates. The `.tabs` container has `padding: 4px`, so tab height = 4 + 12 + ~21 + 12 + 4 = 53px. That's fine.

4. **11px chart axis labels — borderline too small for mobile glanceability**
   - **Measured:** Axis tick "-0.312" renders at 11px. [Source: audit.json tinyText both themes]
   - **Design brief says:** 11px is intentional per §2.2 chart axis labels spec.
   - **WCAG:** No minimum font size requirement per se (SC 1.4.4 requires text can be resized to 200%), but 11px at arm's length on a 390px phone is genuinely hard to read for many users.
   - **Fix:** Bump to 12px. The chart has 320px height and 44px axis width — plenty of room.

---

### HIGH — Clarity & Information Hierarchy

5. **Badge doesn't tell the user WHICH metric is dangerous (glanceability gap)**
   - **Measured:** The badge shows "✕ Danger / Better not today" but only a generic label. The actual reason (water level −0.31m, threshold ≤−0.24) is hidden behind a tap-to-open modal. [Source: audit.json a11yTreeSample shows badge text + code inspection of SafetyBadge.tsx modal logic]
   - **Current data context:** Level = −0.31m (danger band ≤−0.24). Flow = 62 m³/s (caution). So the user should immediately know it's the **level** causing the danger.
   - **Fix:** Include the failing metric(s) directly in the badge description. Pass the `level` breakdown from `App.tsx` and render e.g. "Level too low (−0.31m) — Better not today" or "⚠ Flow (62 m³/s) + Level (−0.31m)". The modal can still exist for full details.
   - **Code change:** `SafetyBadge` component receives `current` data; compute and display the primary failing metric name + value in `badge__desc`. The `aria-label` should also be updated to announce e.g. "Danger — water level is too low at -0.31 meters. Better not today."

6. **Uniform 16px vertical gaps create flat hierarchy (the "feels off" cause)**
   - **Measured:** Every section-to-section gap is exactly 16px: header→badge, badge→grid, grid→section-head, section-head→tabs, tabs→chart, chart→footer. [Source: audit.json verticalGaps]
   - **Why it matters:** Identical spacing between all sections means the eye gets no visual rhythm cues. The safety badge (hero element) has the same visual separation from the grid as the footer does from the chart. This makes the layout feel monotonous and fails to emphasize the information hierarchy — the badge should feel visually grouped with the data it summarizes.
   - **Fix:** Use tiered gaps:
     - **Before badge (header→badge):** 12px (tighter connection between app identity and primary CTA)
     - **After badge (badge→grid):** 20px (slightly more breathing for the hero element)
     - **Before section head (grid→section-head):** 20px (section boundary)
     - **Around tabs (section-head→tabs, tabs→chart/table):** 12px (tabs belong to the chart section)
     - **Before footer:** 24px (visual end of content before meta info)
   - **CSS change:** Replace the uniform `gap: 16px` on `.app` with targeted margins on section elements, or add section-specific gap classes.

7. **No heading landmarks for screen reader navigation**
   - **Measured:** The "7-day forecast" section title is a `<span>` with class `section-head__title`. The accessibility tree shows no `<h2>` or `role="heading"` elements between the `<h1>` title and the footer. [Source: audit.json a11yTreeSample + App.tsx Line: 80-87]
   - **Why it matters:** Screen reader users navigate by headings. Without heading landmarks below the `<h1>`, they must read linearly through the entire page.
   - **Fix:** Change `<span className="section-head__title">` to `<h2 className="section-head__title">`. Add `role="heading"` and `aria-level="2"` as fallback.

8. **Card density: 173×89px with 16px padding leaves minimal breathing room**
   - **Measured:** Cards are 173×89px on 390px viewport. With `padding: 16px`, content area is 141×57px. Content stack: label (12px) + margin-top 6px + value (28px) + unit (13px) = ~59px vertical, leaving −2px (overflow possible). [Source: audit.json sectionBoxes .card + styles.css .card padding/margins]
   - **Why it matters:** Users perceive cramped data displays as harder to scan. The 28px value tightly abuts the label above, and the unit sits directly adjacent to the value.
   - **Fix:** Either (a) reduce card padding to 14px, giving 145×61px content area, or (b) increase card height to 104px by adding `min-height: 104px` or removing the fixed grid row auto-sizing. Option (c): reduce `card__value` margin-top from 6px to 4px and reduce `card__unit` font-size spacing.

---

### MEDIUM — Polish & Visual Weight

9. **Safety badge uses `role="status"` on a `<button>` — conflicting semantics**
   - **Measured:** `<button className="badge" role="status" aria-live="polite">` — a button with live-region role. [Source: SafetyBadge.tsx Line: 24-29]
   - **Why it matters:** `role="status"` maps to an ARIA live region that should announce content changes. But a `<button>` is an interactive element. Assistive technology may either ignore the `role="status"` (because buttons can't be live regions in some AT) or announce it oddly. The element is simultaneously an interactive control and a passive region.
   - **Fix:** Keep the element as a `<button>` (it needs to be tappable) but remove `role="status"`. Instead, add `aria-describedby` to link to the description. Or use a `<div>` with `role="button"` and `tabIndex="0"` plus `role="status"` — but that's fragile. Best: remove `role="status"` and `aria-live="polite"` — the badge updates on data refresh which already triggers re-render. If live announcement is desired, wrap the badge section in a container with `aria-live="polite"` and `aria-atomic="true"`.

10. **Section headings lack visual weight — no differentiation from surrounding content**
    - **Measured:** The "7-day forecast" heading is a bare text `<span>` with `1.125rem` bold, sitting directly above the tab bar with only 16px of separation. No background, no border, no icon. [Source: styles.css .section-head + App.tsx]
    - **Why it matters:** Section headings act as scan anchors. Without visual differentiation, users must read the text to understand where new content begins.
    - **Fix:** Add a subtle bottom border to `.section-head` or increase its `font-size` to `1.25rem` and add `margin-bottom: 4px`. Alternatively, add the weather-icon SVG as a small lead-in marker.

11. **A11y tree is flat — all page text concatenated into one string for screen readers**
    - **Measured:** The accessibility tree sample shows all text from `<h1>`, subtitle, language toggle, theme toggle, badge, and grid smushed into a single text node: `"Limmat BöötleShould I float today?EN☾✕DangerBetter"`. [Source: audit.json a11yTreeSample both themes]
    - **Root cause:** Likely the `<div className="app">` wrapper has no landmark role, and the various display elements lack clear separation (no `aria-labelledby`, missing `role="region"` on sections). The header using `<h1>` correctly is good, but the rest of the page has no heading structure.
    - **Fix:** Wrap the 2×2 grid in `<section aria-labelledby="conditions-heading">` (with `id="conditions-heading"` as a visually-hidden h2), wrap the forecast area similarly. Add `role="group"` to the forecast section or `aria-label="7-day forecast conditions"`.

12. **Table cells colored by safety level use color alone — no text/symbol indicator**
    - **Measured:** In `ForecastTable.tsx` line 29-33: `<td className="num" style={{ color: 'var(--${speedSafety(d.waterSpeed)})' }}>`. The CSS variable resolves to `--safe`, `--caution`, or `--danger` — which are the **background** badge colors. In dark mode, `--safe: #4ADE80` is a bright green on `--card: #14233A` (dark navy). The contrast is ~6:1 (passes), but the green/amber/red encoding is **color-only**. [Source: ForecastTable.tsx + tokens.css]
    - **Design brief says (§5.1):** "Never rely on color alone" — shape + icon + label + position. The table violates this.
    - **Fix:** Add a small colored dot + icon (●✓, ▲!, ◆✗) or a colored left-border to the cell alongside the colored text. Or prefix the value with the safety symbol (✓/!/✗).

---

### LOW — Nice-To-Have

13. **"Updated just now" timestamp uses relative time — no absolute timestamp accessible**
    - The `<span className="updated">` shows relative time (e.g., "Updated just now"). This is good for glanceability but users who need exact time for decision-making (e.g., "is this data 30 minutes old?") have no way to see the actual timestamp.
    - **Fix:** Add `title` attribute with ISO datetime, or alternate between relative and absolute.

14. **Single hardcoded `waterLevel = "safe"` in ConditionsGrid**
    - `ConditionsGrid.tsx` line 36: `const waterLevel = "safe";` — water temperature is always shown with a green dot regardless of actual conditions. While there's no temperature threshold currently, this could confuse users who see a "safe" green dot on a 32°C water reading (which would be dangerously high for swimming).
    - **Fix:** Either remove the dot for water temp, or add actual heating/cooling thresholds.

15. **Modal overlay lacks focus trap**
    - The criteria modal (`showCriteria` state) has no focus trap. After opening via keyboard, Tab will move to elements behind the overlay. [Source: App.tsx lines 100-116: no focus management]
    - **Fix:** Add a simple focus trap or `inert` attribute on background elements when modal is open. At minimum, auto-focus the close button.

16. **Card corner dot (12×12px) is `aria-hidden` — correct but the color information is lost for screen readers**
    - The dot is correctly hidden from AT, but the safety state it conveys should be announced elsewhere. Each card should have its safety status included in its `aria-label` or announced via the parent grid.
    - Currently the grid container has no `aria-label` and the cards have no accessible safety indication beyond the visible color dot.
    - **Fix:** Add `aria-label` to each card reflecting its safety status, e.g. `<div className="card" aria-label="Air temperature: 30°C, safe condition">`.

---

## Sources

- **Kept: audit.json** (/home/gibberish711/dev/limmat/.ux-shots/audit.json) — Measured data from real rendered page at 390px viewport. All contrast ratios, geometry, and a11y tree data come from this file.
- **Kept: styles.css** (/home/gibberish711/dev/limmat/src/styles.css) — Current styling implementation; referenced for padding, font, and layout values.
- **Kept: tokens.css** (/home/gibberish711/dev/limmat/src/theme/tokens.css) — Design token values; referenced for all color comparisons.
- **Kept: SafetyBadge.tsx** — Badge component source; confirms no metric-specific reason is shown.
- **Kept: ForecastTable.tsx** — Confirms color-only safety encoding in table cells.
- **Kept: App.tsx** — Main layout; confirms flat heading structure and modal implementation.
- **Kept: DESIGN_BRIEF.md** — Design spec; used to compare intended vs actual contrast validation.

- **Dropped (for this critique):** Header.tsx, ConditionsGrid.tsx, ForecastChart.tsx — component structure reviewed but no unique findings beyond what audit.json captured.

---

## Gaps
- The chart's exact Recharts rendering colors for tooltip, gridlines, and line strokes were not verified pixel-by-pixel against WCAG 1.4.11 (non-text contrast ≥3:1). The chart lines (`#00B4D8` speed, `#F59E0B` height) should be verified against the card background in both themes.
- The modal's focus-trap behavior was inferred from code review, not tested with a screen reader.
- The font-size for "Updated just now" (0.75rem = 12px) was not measured but should be verified for readability on mobile.
- The weather icon SVGs used in chart axes (rendered via nested `<svg>`) were not inspected for accessible labeling — the `aria-label` on the icon component may not propagate through the Recharts SVG hierarchy correctly.

---

## Top 5 Fixes To Do First

| # | Fix | Level | Effort | Impact |
|---|-----|-------|--------|--------|
| 1 | **Dark mode badge contrast** — change `--danger` to `#C03535` in dark mode tokens | Critical WCAG Fail | 1 line | Blocks AA certification |
| 2 | **Inactive tab text contrast** — adjust `--text-secondary` usage or add dedicated tab color | Critical WCAG Fail | 1-2 lines | Fixes 2 AA failures (light+dark) |
| 3 | **Tab touch targets** — increase `.tab` padding from 10px to 12px | Critical WCAG Fail | 1 line | Meets 44px minimum |
| 4 | **Badge shows the "why"** — pass failing metric(s) into SafetyBadge and render in description | High Glanceability | ~10 lines in App.tsx + SafetyBadge.tsx | Biggest "feels off" fix |
| 5 | **Add heading landmarks** — change forecast `<span>` to `<h2>`, wrap grid in `<section>` with label | High A11y | 3-4 lines | Crucial for screen reader navigation |

---

```acceptance-report
{
  "criteriaSatisfied": [
    {
      "id": "criterion-1",
      "status": "satisfied",
      "evidence": "Produced a prioritized UX critique written to /home/gibberish711/dev/limmat/research.md based on measured audit data, source code review, and design brief comparison. Scope limited to critique and actionable fixes — no implementation code written, no redesign proposed."
    }
  ],
  "changedFiles": [
    "/home/gibberish711/dev/limmat/research.md"
  ],
  "testsAddedOrUpdated": [],
  "commandsRun": [
    {
      "command": "read audit.json, DESIGN_BRIEF.md, App.tsx, styles.css, tokens.css, all 4 component files, research.md",
      "result": "passed",
      "summary": "Read all 9 relevant files to understand current implementation, design intent, and measured audit data"
    },
    {
      "command": "write research.md",
      "result": "passed",
      "summary": "Produced ~7KB critique with 16 prioritized findings, 5 top-priority fixes, and measured evidence for all critical failures"
    }
  ],
  "validationOutput": [
    "Contrast calculations verified: #FB7171 (white text) = 2.73:1 FAILS; proposed #C03535 (white text) = 5.50:1 PASSES",
    "Tab contrast: light 4.29:1 FAILS (needs ≥4.5:1), dark 3.98:1 FAILS (needs ≥4.5:1)",
    "Tab touch target: 41px FAILS (needs ≥44px)"
  ],
  "residualRisks": [
    "Chart non-text contrast (speed line #00B4D8, height line #F59E0B) not pixel-verified against card backgrounds — should be checked before release",
    "ForecastTable inline `style={{ color: 'var(--${...})' }}` uses safety colors as text colors which may have insufficient contrast on card background — should be verified per value",
    "Weather icons in Recharts SVG hierarchy may not propagate accessible labels",
    "No focus trap on criteria modal — verified via code review but not screen-reader tested"
  ],
  "noStagedFiles": true,
  "notes": "The design brief's contrast table was misleading: it measured badge colors against the page background (#0A1628) but the actual use case is white text ON the badge fill. This is the root cause of the 2.73:1 dark-mode contrast failure. The design brief should be updated to include inner-badge contrast validation."
}
```

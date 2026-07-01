// Decorative background: inflatable-donut "Böötle" floats drifting left→right,
// evoking the Limmat itself. Purely cosmetic — pointer-events:none, behind
// content (z-index 0; .app sits at z-index 1). Honors prefers-reduced-motion
// by rendering the buoys scattered & static instead of animated.
//
// Respawn model: ~10 fixed DOM nodes (no GC churn → phone-battery safe). On
// each animationiteration event (fires once per crossing, every 30–90s — not
// per frame), every buoy reshuffles: new color, vertical lane, size, in-flight
// rotation, speed, and slight diagonal. So each crossing looks different,
// forever, without the repetition of a static keyframe loop.

import { useEffect, useRef } from "react";
import { LifeBuoy } from "lucide-react";

// Brand + buoy-ish palette. Tinted via currentColor; opacity keeps them as
// background texture rather than foreground noise.
const COLORS = [
  "#0077b6", // water blue
  "#48cae4", // light cyan
  "#90e0ef", // pale cyan
  "#fb7185", // rose (classic lifebuoy red)
  "#f97316", // orange (classic lifebuoy orange)
  "#fbbf24", // amber
  "#4ade80", // green
];

const COUNT = 10;

const rnd = (min: number, max: number) => min + Math.random() * (max - min);
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

interface BuoySpec {
  color: string;
  top: number; // %, entry lane
  dy: number; // vh, continuous vertical delta across the crossing (~travel angle)
  size: number; // px
  rot: number; // deg, static tilt
  spin: number; // deg, total in-flight rotation across the crossing
  dur: number; // s, drift duration
  delay: number; // s, negative => starts mid-loop
  restX: number; // vw, static scatter for reduced-motion
  opacity: number;
}

/** Generate a fresh spec — used for the initial pass and every reshuffle. */
const makeSpec = (): BuoySpec => {
  const dur = rnd(30, 72);
  const top = rnd(4, 92);
  return {
    color: pick(COLORS),
    top,
    // Continuous diagonal: drift up/down across the full crossing. ±28vh ≈ a
    // ±17° travel angle on a phone (clearly diagonal, not strictly L→R).
    dy: rnd(-28, 28),
    size: rnd(28, 64),
    rot: rnd(-18, 18),
    spin: rnd(-24, 24),
    dur,
    delay: -rnd(0, dur), // negative spreads buoys across the timeline on first pass
    restX: rnd(2, 92),
    opacity: rnd(0.14, 0.26),
  };
};

/** Apply a spec to a DOM node via CSS custom props + styles. */
const apply = (el: HTMLElement, s: BuoySpec) => {
  el.style.color = s.color;
  el.style.top = `${s.top}%`;
  el.style.opacity = String(s.opacity);
  el.style.animationDuration = `${s.dur}s`;
  el.style.animationDelay = `${s.delay}s`;
  el.style.setProperty("--dy", `${s.dy}vh`);
  el.style.setProperty("--spin", `${s.spin}deg`);
  const tilt = el.firstElementChild as HTMLElement;
  if (tilt) tilt.style.transform = `rotate(${s.rot}deg)`;
  // restX is only used in reduced-motion fallback (animation disabled) — refresh it too
  el.style.setProperty("--rest-x", `${s.restX}vw`);
};

export const FloatingBuoy = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    // Initial state already set by the JSX below; wire reshuffle on each loop.
    const buoys = [...container.querySelectorAll<HTMLElement>(".buoy")];
    const handlers: Array<{ el: HTMLElement; fn: () => void }> = [];
    for (const el of buoys) {
      // First reshuffle drops the artificial delay so the *next* crossing is fresh,
      // but we keep entry visual for the very first pass.
      const fn = () => apply(el, { ...makeSpec(), delay: 0 });
      el.addEventListener("animationiteration", fn);
      handlers.push({ el, fn });
    }
    return () => {
      for (const { el, fn } of handlers) el.removeEventListener("animationiteration", fn);
    };
  }, []);

  // Initial specs (stable across first render via memo-in-state pattern):
  // generate once at module scope is unsafe for SSR, so do it inline here.
  const specs = useRef<BuoySpec[]>(
    Array.from({ length: COUNT }, makeSpec),
  ).current;

  return (
    <div className="bg-buoys" aria-hidden="true" ref={containerRef}>
      {specs.map((s, i) => (
        <span
          key={i}
          className="buoy"
          style={{
            top: `${s.top}%`,
            opacity: s.opacity,
            color: s.color,
            animationDuration: `${s.dur}s`,
            animationDelay: `${s.delay}s`,
            ["--dy" as string]: `${s.dy}vh`,
            ["--spin" as string]: `${s.spin}deg`,
            ["--rest-x" as string]: `${s.restX}vw`,
          }}
        >
          <span
            className="buoy__tilt"
            style={{ transform: `rotate(${s.rot}deg)`, width: s.size, height: s.size }}
          >
            <LifeBuoy size={s.size} strokeWidth={1.5} />
          </span>
        </span>
      ))}
    </div>
  );
};

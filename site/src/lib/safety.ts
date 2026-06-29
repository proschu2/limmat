// Safety thresholds — mirrors worker/src/safety.ts. See docs/DATA_SPEC.md.
// Kept in sync manually; small enough not to warrant a shared package.

import type { SafetyLevel } from "./types";

export const heightSafety = (deltaM: number): SafetyLevel => {
  if (deltaM <= -0.24 || deltaM >= 0.79) return "danger";
  if (deltaM <= 0.1 || deltaM >= 0.45) return "caution";
  return "safe";
};

export const speedSafety = (m3s: number): SafetyLevel => {
  if (m3s <= 60 || m3s >= 165) return "danger";
  if (m3s <= 85 || m3s >= 145) return "caution";
  return "safe";
};

export const weatherSafety = (code: number): SafetyLevel => {
  if (code >= 50) return "danger";
  if (code >= 40) return "caution";
  return "safe";
};

const ORDER: Record<SafetyLevel, number> = { safe: 0, caution: 1, danger: 2 };
export const worst = (...levels: SafetyLevel[]): SafetyLevel =>
  levels.reduce((a, b) => (ORDER[b] > ORDER[a] ? b : a), "safe");

// Shape + glyph per design brief §5.1 — never color alone (colorblind-safe).
// Shared by the hero badge and the per-day grade pills.
export const SAFETY_GLYPH: Record<SafetyLevel, string> = {
  safe: "✓",
  caution: "!",
  danger: "✕",
};

/** Overall grade for a forecast day (worst of height/speed/weather). */
export const dayGrade = (
  height: number,
  speed: number,
  weatherCode: number | undefined,
): SafetyLevel =>
  weatherCode !== undefined
    ? worst(heightSafety(height), speedSafety(speed), weatherSafety(weatherCode))
    : worst(heightSafety(height), speedSafety(speed));

/** Machine-readable cause keys for a given safety level (the "why"). */
export type Cause =
  | "heightLow"
  | "heightHigh"
  | "speedLow"
  | "speedHigh"
  | "weather";

export const causesAtLevel = (
  height: number,
  speed: number,
  weatherCode: number,
  level: SafetyLevel,
): Cause[] => {
  const out: Cause[] = [];
  if (heightSafety(height) === level)
    out.push(height <= 0.1 ? "heightLow" : "heightHigh");
  if (speedSafety(speed) === level)
    out.push(speed <= 85 ? "speedLow" : "speedHigh");
  if (weatherSafety(weatherCode) === level) out.push("weather");
  return out;
};

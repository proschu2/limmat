// Clear, recognizable weather icons via Lucide (MIT).
// Color-tinted by category so the type reads at a glance, not just the shape.
// Used in the chart tick, conditions grid, and forecast table.

import {
  Sun,
  CloudSun,
  Cloud,
  CloudFog,
  CloudRain,
  CloudSnow,
  CloudLightning,
  type LucideProps,
} from "lucide-react";
import type { WeatherInfo } from "./weather-codes";

export type WeatherKind =
  | "sun"
  | "partly"
  | "cloud"
  | "fog"
  | "rain"
  | "snow"
  | "storm";

export const codeToKind = (code: number): WeatherKind => {
  if (code <= 1) return "sun";
  if (code <= 3) return code === 2 ? "partly" : "cloud";
  if (code <= 48) return "fog";
  if (code <= 67 || (code >= 80 && code <= 82)) return "rain";
  if (code <= 77 || code === 85 || code === 86) return "snow";
  return "storm"; // 95–99
};

const ICONS: Record<WeatherKind, typeof Sun> = {
  sun: Sun,
  partly: CloudSun,
  cloud: Cloud,
  fog: CloudFog,
  rain: CloudRain,
  snow: CloudSnow,
  storm: CloudLightning,
};

// Category colors — distinct, read on both light & dark cards.
const COLORS: Record<WeatherKind, string> = {
  sun: "#f59e0b", // amber — warm, high visibility
  partly: "#eab308", // yellow-gold
  cloud: "#64748b", // slate — neutral
  fog: "#94a3b8", // lighter slate
  rain: "#0ea5e9", // sky blue
  snow: "#38bdf8", // light cyan
  storm: "#a855f7", // purple
};

interface Props {
  code: number;
  size?: number;
  strokeWidth?: number;
  /** Tinted color per category (default) or a single override color. */
  color?: string;
  /** Accessible label from weather-codes.ts weatherInfo(). */
  label?: string;
}

export const WeatherIcon = ({
  code,
  size = 20,
  strokeWidth = 2,
  color,
  label,
}: Props) => {
  const kind = codeToKind(code);
  const Icon = ICONS[kind];
  const props: LucideProps = {
    size,
    strokeWidth,
    color: color ?? COLORS[kind],
    "aria-hidden": label ? undefined : true,
    role: label ? "img" : undefined,
    "aria-label": label,
    absoluteStrokeWidth: true,
  };
  return <Icon {...props} />;
};

/** Keep WeatherInfo type re-exported so callers can pass label cleanly. */
export type { WeatherInfo };

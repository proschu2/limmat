// Shared client types — must match worker/src/types.ts output shape.

export type SafetyLevel = "safe" | "caution" | "danger";

export interface CurrentConditions {
  waterHeight: number; // Δ m (can be negative)
  waterSpeed: number; // m³/s, integer
  waterTemperature: number; // °C, 1 decimal
  updatedAt: string; // ISO
}

export interface ForecastDay {
  date: string; // YYYY-MM-DD (Europe/Zurich)
  waterHeight: number; // Δ m, 2 decimals
  waterSpeed: number; // m³/s, integer
}

export interface Forecast {
  days: ForecastDay[];
  updatedAt: string;
}

// Weather from open-meteo (fetched browser-side; CORS-allowed).
export interface Weather {
  currentTemperature: number; // °C
  currentWeatherCode: number; // WMO
  /** Daily forecast: date YYYY-MM-DD → WMO code. */
  daily: Record<string, number>;
  updatedAt: string;
}

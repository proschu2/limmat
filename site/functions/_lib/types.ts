// Data types — single source of truth for the API output shape.
// Mirrors docs/DATA_SPEC.md and site/src/lib/types.ts.

/** Live/current conditions for station 2099 (+ temp from 2243). */
export interface CurrentConditions {
  /** Water level Δ from datum 400.35 m, in meters (can be negative). */
  waterHeight: number;
  /** Discharge / flow speed in m³/s (integer). */
  waterSpeed: number;
  /** Water temperature in °C, 1 decimal. From station 2243. */
  waterTemperature: number;
  /** ISO timestamp of when this was parsed. */
  updatedAt: string;
}

/** One forecast day. Weather is merged in client-side from open-meteo. */
export interface ForecastDay {
  /** Calendar date in Europe/Zurich, YYYY-MM-DD. */
  date: string;
  /** Water level Δ from datum 400.35 m, in meters (2 decimals). */
  waterHeight: number;
  /** Discharge / flow speed in m³/s (integer). */
  waterSpeed: number;
}

export interface Forecast {
  days: ForecastDay[];
  updatedAt: string;
}

// --- Internal shapes for parsing the hydrodaten response ---------------

export interface PlotTrace {
  name: string;
  x: string[]; // timestamps
  y: number[]; // values
}

export interface HydroResponse {
  plot: {
    data: PlotTrace[];
  };
}

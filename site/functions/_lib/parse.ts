// Parsing logic for hydrodaten.admin.ch responses.
// Reverse-engineered from docs/DATA_SPEC.md. This is the ONLY place this
// logic lives (kills the old 150-line Dart/TS duplication + timezone bug).

import type {
  CurrentConditions,
  Forecast,
  ForecastDay,
  HydroResponse,
  PlotTrace,
} from "./types";

/**
 * Station 2099 reports water level in meters above sea level (m a.s.l.),
 * ~400.35 m. The app shows the Δ (deviation) from this datum.
 * Named constant — appears 6× unexplained in the old code.
 */
export const DATUM_M = 400.35;

const round = (n: number, decimals = 0): number => {
  const f = Math.pow(10, decimals);
  return Math.round(n * f) / f;
};

/**
 * Convert a timestamp string to a YYYY-MM-DD calendar-date key in
 * Europe/Zurich local time.
 *
 * FIXES the old timezone bug: the old Dart path parsed in local time while the
 * old TS path used toISOString() (UTC). Same upstream data → different date
 * buckets → web/mobile disagreed. Standardized on Europe/Zurich.
 */
const zurichDateKey = (timestamp: string): string => {
  const dt = new Date(timestamp);
  // en-CA locale formats calendar dates as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Zurich",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(dt);
};

/** Find a named trace in the hydrodaten plot data. */
const findTrace = (data: PlotTrace[], name: string): PlotTrace => {
  const trace = data.find((t) => t.name === name);
  if (!trace) {
    throw new Error(`Trace "${name}" not found in plot data`);
  }
  return trace;
};

/**
 * Bucket timestamps by Zurich date and average the values per day.
 * Returns a Map<YYYY-MM-DD, number> sorted ascending by date.
 */
const averageByDate = (
  x: string[],
  y: number[],
  round2: boolean,
): Map<string, number> => {
  const sums = new Map<string, [number, number]>(); // [sum, count]

  for (let i = 0; i < x.length; i++) {
    const key = zurichDateKey(x[i]);
    const value = y[i];
    const entry = sums.get(key);
    if (entry) {
      entry[0] += value;
      entry[1] += 1;
    } else {
      sums.set(key, [value, 1]);
    }
  }

  const result = new Map<string, number>();
  const sortedKeys = [...sums.keys()].sort();
  for (const key of sortedKeys) {
    const [sum, count] = sums.get(key)!;
    result.set(key, round2 ? round(sum / count, 2) : round(sum / count, 0));
  }
  return result;
};

// --- Upstream URLs (station 2099 = Limmat, 2243 = temperature) --------

const URL_HEIGHT_FORECAST =
  "https://www.hydrodaten.admin.ch/plots/p_forecast/2099_p_forecast_de.json";
const URL_SPEED_FORECAST =
  "https://www.hydrodaten.admin.ch/plots/q_forecast/2099_q_forecast_de.json";
const URL_CURRENT_7D =
  "https://www.hydrodaten.admin.ch/plots/p_q_7days/2099_p_q_7days_en.json";
const URL_TEMPERATURE_7D =
  "https://www.hydrodaten.admin.ch/plots/temperature_7days/2243_temperature_7days_en.json";

/** Fetch + parse a hydrodaten JSON response. */
const fetchHydro = async (url: string): Promise<HydroResponse> => {
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Upstream ${url} returned ${res.status}`);
  }
  return (await res.json()) as HydroResponse;
};

// --- Public parsers ----------------------------------------------------

/**
 * Current conditions: last "Water level" + last "Discharge" from the 7-day
 * file, and last temperature reading from station 2243.
 */
export const parseCurrent = async (): Promise<CurrentConditions> => {
  const [statusRes, tempRes] = await Promise.all([
    fetchHydro(URL_CURRENT_7D),
    fetchHydro(URL_TEMPERATURE_7D),
  ]);

  const heightTrace = findTrace(statusRes.plot.data, "Water level");
  const speedTrace = findTrace(statusRes.plot.data, "Discharge");
  const tempTrace = tempRes.plot.data[0];

  const lastHeightRaw = heightTrace.y[heightTrace.y.length - 1];
  const lastSpeedRaw = speedTrace.y[speedTrace.y.length - 1];
  const lastTempRaw = tempTrace.y[tempTrace.y.length - 1];

  return {
    waterHeight: round(lastHeightRaw - DATUM_M, 2),
    waterSpeed: round(lastSpeedRaw, 0),
    waterTemperature: round(lastTempRaw, 1),
    updatedAt: new Date().toISOString(),
  };
};

/**
 * Multi-day forecast: take the "Median" trace from each forecast file,
 * bucket by Zurich date and average. Merge height + speed per date.
 */
export const parseForecast = async (): Promise<Forecast> => {
  const [heightRes, speedRes] = await Promise.all([
    fetchHydro(URL_HEIGHT_FORECAST),
    fetchHydro(URL_SPEED_FORECAST),
  ]);

  const heightTrace = findTrace(heightRes.plot.data, "Median");
  const speedTrace = findTrace(speedRes.plot.data, "Median");

  const heightDeltas = heightTrace.y.map((v) => v - DATUM_M);
  const heightByDate = averageByDate(heightTrace.x, heightDeltas, true);
  const speedByDate = averageByDate(speedTrace.x, speedTrace.y, false);

  const days: ForecastDay[] = [];
  for (const [date, waterHeight] of heightByDate) {
    const waterSpeed = speedByDate.get(date);
    if (waterSpeed === undefined) continue;
    days.push({ date, waterHeight, waterSpeed });
  }

  return { days, updatedAt: new Date().toISOString() };
};

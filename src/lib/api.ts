// API client: river data via Worker (/api/*), weather direct from open-meteo.
// 30-min client cache to avoid hammering endpoints on every navigation.

import type { CurrentConditions, Forecast, Weather, DailyWeather } from "./types";

const CACHE_MS = 30 * 60 * 1000;

interface CacheEntry<T> {
  data: T;
  at: number;
}

const read = <T>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const e = JSON.parse(raw) as CacheEntry<T>;
    if (Date.now() - e.at > CACHE_MS) return null;
    return e.data;
  } catch {
    return null;
  }
};

const write = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify({ data, at: Date.now() }));
  } catch {
    /* quota / disabled — non-fatal */
  }
};

const get = async <T>(key: string, url: string): Promise<T> => {
  const cached = read<T>(key);
  if (cached) return cached;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  const data = (await res.json()) as T;
  write(key, data);
  return data;
};

export const fetchCurrent = (): Promise<CurrentConditions> =>
  get("lbg:current", "/api/current");

export const fetchForecast = (): Promise<Forecast> =>
  get("lbg:forecast", "/api/forecast");

const WEATHER_URL =
  "https://api.open-meteo.com/v1/forecast?latitude=47.392574&longitude=8.520825&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Europe%2FZurich&forecast_days=7";

export const fetchWeather = async (): Promise<Weather> => {
  const raw = await get<{
    current: { temperature_2m: number; weather_code: number };
    daily: {
      time: string[];
      weather_code: number[];
      temperature_2m_max: number[];
      temperature_2m_min: number[];
    };
  }>("lbg:weather2", WEATHER_URL); // bumped cache key: new daily shape
  const daily: Record<string, DailyWeather> = {};
  raw.daily.time.forEach((d, i) => {
    daily[d] = {
      code: raw.daily.weather_code[i],
      tempMax: raw.daily.temperature_2m_max[i],
      tempMin: raw.daily.temperature_2m_min[i],
    };
  });
  return {
    currentTemperature: raw.current.temperature_2m,
    currentWeatherCode: raw.current.weather_code,
    daily,
    updatedAt: new Date().toISOString(),
  };
};

/** Bypass cache for manual refresh. */
export const clearCache = (): void => {
  localStorage.removeItem("lbg:current");
  localStorage.removeItem("lbg:forecast");
  localStorage.removeItem("lbg:weather");
  localStorage.removeItem("lbg:weather2");
};

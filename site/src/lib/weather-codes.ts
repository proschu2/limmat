// WMO weather codes → icon + label (en/de). Based on open-meteo spec.
// Icons are inline SVG paths so we ship zero icon-library weight.

export interface WeatherInfo {
  /** Inline SVG path data (24x24 viewBox, weather-icons style). */
  icon: string;
  en: string;
  de: string;
}

// Simple, recognizable glyph paths (stroke-based, currentColor).
const SUN =
  "M12 7a5 5 0 100 10 5 5 0 000-10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4";
const CLOUD =
  "M6 18a4 4 0 010-8 6 6 0 0111.7-1.5A4 4 0 0118 18z";
const RAIN = CLOUD + "M8 22l-1 2M12 22l-1 2M16 22l-1 2";
const SNOW = CLOUD + "M9 23h.01M13 23h.01M17 23h.01";
const FOG = "M4 12h16M4 16h12M4 8h16M4 20h10";
const STORM = CLOUD + "M12 21l-2-4h3l-2-4";

export const WEATHER_CODES: Record<number, WeatherInfo> = {
  0: { icon: SUN, en: "Clear sky", de: "Klarer Himmel" },
  1: { icon: SUN, en: "Mainly clear", de: "Überwiegend klar" },
  2: { icon: CLOUD, en: "Partly cloudy", de: "Teilweise bewölkt" },
  3: { icon: CLOUD, en: "Overcast", de: "Bewölkt" },
  45: { icon: FOG, en: "Fog", de: "Nebel" },
  48: { icon: FOG, en: "Rime fog", de: "Reifnebel" },
  51: { icon: RAIN, en: "Light drizzle", de: "Leichter Nieselregen" },
  53: { icon: RAIN, en: "Drizzle", de: "Nieselregen" },
  55: { icon: RAIN, en: "Heavy drizzle", de: "Starker Nieselregen" },
  56: { icon: RAIN, en: "Freezing drizzle", de: "Gefrierender Nieselregen" },
  57: { icon: RAIN, en: "Freezing drizzle", de: "Gefrierender Nieselregen" },
  61: { icon: RAIN, en: "Light rain", de: "Leichter Regen" },
  63: { icon: RAIN, en: "Rain", de: "Regen" },
  65: { icon: RAIN, en: "Heavy rain", de: "Starker Regen" },
  66: { icon: RAIN, en: "Freezing rain", de: "Gefrierender Regen" },
  67: { icon: RAIN, en: "Freezing rain", de: "Gefrierender Regen" },
  71: { icon: SNOW, en: "Light snow", de: "Leichter Schnee" },
  73: { icon: SNOW, en: "Snow", de: "Schnee" },
  75: { icon: SNOW, en: "Heavy snow", de: "Starker Schnee" },
  77: { icon: SNOW, en: "Snow grains", de: "Schneegriesel" },
  80: { icon: RAIN, en: "Light showers", de: "Leichte Schauer" },
  81: { icon: RAIN, en: "Showers", de: "Schauer" },
  82: { icon: RAIN, en: "Violent showers", de: "Heftige Schauer" },
  85: { icon: SNOW, en: "Snow showers", de: "Schneeschauer" },
  86: { icon: SNOW, en: "Heavy snow showers", de: "Starke Schneeschauer" },
  95: { icon: STORM, en: "Thunderstorm", de: "Gewitter" },
  96: { icon: STORM, en: "Thunderstorm + hail", de: "Gewitter mit Hagel" },
  99: { icon: STORM, en: "Severe thunderstorm", de: "Schweres Gewitter" },
};

export const weatherInfo = (code: number): WeatherInfo =>
  WEATHER_CODES[code] ?? { icon: CLOUD, en: "Unknown", de: "Unbekannt" };

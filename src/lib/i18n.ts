// Localization — en + de. Simple dictionary, no i18next (only 2 langs).

export type Lang = "en" | "de";

export const STRINGS = {
  en: {
    title: "Limmat Böötle Guide",
    subtitle: "Should I float today?",
    safe: "Safe",
    caution: "Caution",
    danger: "Danger",
    safeDesc: "Good to float",
    cautionDesc: "Check conditions",
    dangerDesc: "Better not today",
    airTemp: "Air",
    waterTemp: "Water",
    airCol: "Air °C",
    speed: "Flow",
    height: "Level",
    speedUnit: "m³/s",
    heightUnit: "m",
    tempUnit: "°C",
    forecast: "{n}-day forecast",
    chart: "Chart",
    table: "Table",
    day: "Day",
    gradeCol: "Go?",
    updatedAt: "Updated",
    loading: "Loading…",
    error: "Couldn't load river data.",
    retry: "Retry",
    tapHint: "Tap for details",
    criteriaTitle: "How we judge it",
    criteriaHeight:
      "Level: safe 0.10–0.45 m, caution near 0.45–0.79 m, danger above 0.79 m or below −0.24 m.",
    criteriaSpeed:
      "Flow: safe 86–144 m³/s, caution 61–85 or 145–164 m³/s, danger ≤60 or ≥165 m³/s.",
    criteriaWeather: "Weather: rain/snow/storm = danger, fog = caution.",
    close: "Close",
    // "Why" reasons for the hero badge (causes).
    reasonSafe: "Flow, level & weather all fine",
    heightLow: "Level too low",
    heightHigh: "Level too high",
    speedLow: "Flow too low",
    speedHigh: "Flow too high",
    weather: "Rough weather",
    source: "Source: hydrodaten.admin.ch · open-meteo.com",
  },
  de: {
    title: "Limmat Böötle Guide",
    subtitle: "Soll ich heute böötle?",
    safe: "Sicher",
    caution: "Vorsicht",
    danger: "Gefahr",
    safeDesc: "Gut zum Böötle",
    cautionDesc: "Bedingungen prüfen",
    dangerDesc: "Heute lieber nicht",
    airTemp: "Luft",
    waterTemp: "Wasser",
    airCol: "Luft °C",
    speed: "Strömung",
    height: "Wasserstand",
    speedUnit: "m³/s",
    heightUnit: "m",
    tempUnit: "°C",
    forecast: "{n}-Tage-Prognose",
    chart: "Diagramm",
    table: "Tabelle",
    day: "Tag",
    gradeCol: "Böötle?",
    updatedAt: "Aktualisiert",
    loading: "Lädt…",
    error: "Flussdaten konnten nicht geladen werden.",
    retry: "Erneut",
    tapHint: "Tippen für Details",
    criteriaTitle: "So beurteilen wir es",
    criteriaHeight:
      "Wasserstand: sicher 0.10–0.45 m, Vorsicht 0.45–0.79 m, Gefahr über 0.79 m oder unter −0.24 m.",
    criteriaSpeed:
      "Strömung: sicher 86–144 m³/s, Vorsicht 61–85 oder 145–164 m³/s, Gefahr ≤60 oder ≥165 m³/s.",
    criteriaWeather: "Wetter: Regen/Schnee/Gewitter = Gefahr, Nebel = Vorsicht.",
    close: "Schliessen",
    reasonSafe: "Strömung, Wasserstand & Wetter sind in Ordnung",
    heightLow: "Wasserstand zu niedrig",
    heightHigh: "Wasserstand zu hoch",
    speedLow: "Strömung zu schwach",
    speedHigh: "Strömung zu stark",
    weather: "Schlechtes Wetter",
    source: "Quelle: hydrodaten.admin.ch · open-meteo.com",
  },
} as const;

export type StringKey = keyof (typeof STRINGS)["en"];

export const t = (lang: Lang, key: StringKey): string => STRINGS[lang][key];

/** Templated lookup: replaces {placeholders} in the string. */
export const tf = (lang: Lang, key: StringKey, vars: Record<string, string | number>): string =>
  STRINGS[lang][key].replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));

// Formatting helpers — Intl-based, locale-aware (en/de).

import type { Lang } from "./i18n";

const LOCALE: Record<Lang, string> = { en: "en-GB", de: "de-CH" };

export const fmtNumber = (lang: Lang, n: number, decimals = 0): string =>
  n.toLocaleString(LOCALE[lang], {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

/** Sign-prefixed number, e.g. +0.05 / -0.10. */
export const fmtSigned = (lang: Lang, n: number, decimals = 2): string => {
  const s = n.toLocaleString(LOCALE[lang], {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return n > 0 ? `+${s}` : s;
};

/** Weekday abbrev, e.g. "Mon" / "Mo". */
export const fmtWeekday = (lang: Lang, dateStr: string): string => {
  const d = new Date(`${dateStr}T00:00:00`);
  return new Intl.DateTimeFormat(LOCALE[lang], { weekday: "short" }).format(d);
};

/** Short date, e.g. "5 Jun" / "5. Juni". */
export const fmtDate = (lang: Lang, dateStr: string): string => {
  const d = new Date(`${dateStr}T00:00:00`);
  return new Intl.DateTimeFormat(LOCALE[lang], {
    day: "numeric",
    month: "short",
  }).format(d);
};

/** Relative time, e.g. "3 min ago" / "vor 3 Min.". */
export const fmtRelative = (lang: Lang, iso: string): string => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return lang === "de" ? "gerade eben" : "just now";
  if (mins < 60) return lang === "de" ? `vor ${mins} Min.` : `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  return lang === "de" ? `vor ${hrs} Std.` : `${hrs} h ago`;
};

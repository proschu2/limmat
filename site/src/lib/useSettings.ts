// Persisted user settings: theme (light/dark) + language (en/de).

import { useEffect, useState } from "react";
import type { Lang } from "./i18n";

export type Theme = "light" | "dark";

const prefersDark = (): boolean =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;

const loadTheme = (): Theme => {
  const saved = localStorage.getItem("lbg:theme");
  if (saved === "light" || saved === "dark") return saved;
  return prefersDark() ? "dark" : "light";
};

const loadLang = (): Lang => {
  const saved = localStorage.getItem("lbg:lang");
  if (saved === "en" || saved === "de") return saved;
  return navigator.language.toLowerCase().startsWith("de") ? "de" : "en";
};

export interface Settings {
  theme: Theme;
  lang: Lang;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  setLang: (l: Lang) => void;
  toggleLang: () => void;
}

export const useSettings = (): Settings => {
  const [theme, setThemeState] = useState<Theme>(loadTheme);
  const [lang, setLangState] = useState<Lang>(loadLang);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("lbg:theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = lang;
    localStorage.setItem("lbg:lang", lang);
  }, [lang]);

  return {
    theme,
    lang,
    setTheme: setThemeState,
    toggleTheme: () => setThemeState((t) => (t === "dark" ? "light" : "dark")),
    setLang: setLangState,
    toggleLang: () => setLangState((l) => (l === "en" ? "de" : "en")),
  };
};

import { useState, useEffect, useCallback } from "react";
import { useSettings } from "./lib/useSettings";
import { Header } from "./components/Header";
import { SafetyBadge } from "./components/SafetyBadge";
import { ConditionsGrid } from "./components/ConditionsGrid";
import { ForecastChart } from "./components/ForecastChart";
import { ForecastTable } from "./components/ForecastTable";
import { fetchCurrent, fetchForecast, fetchWeather, clearCache } from "./lib/api";
import { worst, heightSafety, speedSafety, weatherSafety, causesAtLevel } from "./lib/safety";
import { fmtRelative } from "./lib/format";
import { t, tf } from "./lib/i18n";
import type { CurrentConditions, Forecast, Weather } from "./lib/types";
import "./styles.css";

type View = "chart" | "table";

export default function App() {
  const settings = useSettings();
  const { lang } = settings;

  const [current, setCurrent] = useState<CurrentConditions | null>(null);
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [error, setError] = useState(false);
  const [view, setView] = useState<View>("table");
  const [showCriteria, setShowCriteria] = useState(false);

  const load = useCallback(async () => {
    setError(false);
    try {
      const [c, f, w] = await Promise.all([
        fetchCurrent(),
        fetchForecast(),
        fetchWeather(),
      ]);
      setCurrent(c);
      setForecast(f);
      setWeather(w);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 30 * 60 * 1000); // refresh every 30 min
    return () => clearInterval(id);
  }, [load]);

  const retry = () => {
    clearCache();
    load();
  };

  const overall =
    current && weather
      ? worst(
          heightSafety(current.waterHeight),
          speedSafety(current.waterSpeed),
          weatherSafety(weather.currentWeatherCode),
        )
      : null;

  // Build the "why" for the hero badge from the metric(s) at the overall level.
  const reason =
    current && weather && overall
      ? overall === "safe"
        ? t(lang, "reasonSafe")
        : causesAtLevel(
            current.waterHeight,
            current.waterSpeed,
            weather.currentWeatherCode,
            overall,
          )
            .map((c) => t(lang, c))
            .join(" · ")
      : undefined;

  // Forecast title reflects the actual day count (BAFU publishes a 6-day
  // horizon; the label derives from the data so it's never wrong).
  const forecastLabel = tf(lang, "forecast", { n: forecast?.days.length ?? 6 });

  const updatedAt = current?.updatedAt ?? weather?.updatedAt;

  return (
    <div className="app">
      <Header settings={settings} />

      {error && !current ? (
        <div className="state--error">
          <p>{t(lang, "error")}</p>
          <button className="retry-btn" onClick={retry}>
            {t(lang, "retry")}
          </button>
        </div>
      ) : !current || !weather ? (
        <div className="state--loading">
          <p>{t(lang, "loading")}</p>
        </div>
      ) : (
        <>
          <div aria-live="polite" aria-atomic="true">
            {overall && (
              <SafetyBadge
                level={overall}
                lang={lang}
                reason={reason}
                onExplain={() => setShowCriteria(true)}
              />
            )}
          </div>

          <section aria-label={t(lang, "airTemp")}>
            <ConditionsGrid current={current} weather={weather} lang={lang} />
          </section>

          <section aria-label={forecastLabel}>
            <div className="section-head">
              <h2 className="section-head__title">{forecastLabel}</h2>
              {updatedAt && (
                <span className="updated">
                  {t(lang, "updatedAt")} {fmtRelative(lang, updatedAt)}
                </span>
              )}
            </div>

            <div className="tabs" role="tablist">
              <button
                role="tab"
                aria-selected={view === "table"}
                className={`tab ${view === "table" ? "tab--active" : ""}`}
                onClick={() => setView("table")}
              >
                {t(lang, "table")}
              </button>
              <button
                role="tab"
                aria-selected={view === "chart"}
                className={`tab ${view === "chart" ? "tab--active" : ""}`}
                onClick={() => setView("chart")}
              >
                {t(lang, "chart")}
              </button>
            </div>

            {forecast ? (
              view === "table" ? (
                <ForecastTable
                  forecast={forecast}
                  weather={weather}
                  lang={lang}
                />
              ) : (
                <ForecastChart forecast={forecast} weather={weather} lang={lang} />
              )
            ) : null}
          </section>

          <div className="footer">{t(lang, "source")}</div>
        </>
      )}

      {showCriteria && (
        <div
          className="modal-overlay"
          onClick={() => setShowCriteria(false)}
          role="dialog"
          aria-modal="true"
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{t(lang, "criteriaTitle")}</h2>
            <ul>
              <li>{t(lang, "criteriaHeight")}</li>
              <li>{t(lang, "criteriaSpeed")}</li>
              <li>{t(lang, "criteriaWeather")}</li>
            </ul>
            <button className="retry-btn" onClick={() => setShowCriteria(false)}>
              {t(lang, "close")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

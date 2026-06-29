import type { Settings } from "../lib/useSettings";

interface Props {
  settings: Settings;
}

export const Header = ({ settings }: Props) => {
  const { lang, toggleLang, theme, toggleTheme } = settings;
  return (
    <header className="header">
      <div>
        <h1 className="header__title">Limmat Böötle Guide</h1>
        <p className="header__subtitle">
          {lang === "de" ? "Soll ich heute böötle?" : "Should I float today?"}
        </p>
      </div>
      <div className="header__actions">
        <button
          className="icon-btn"
          onClick={toggleLang}
          aria-label="Switch language"
          title={lang === "en" ? "Auf Deutsch" : "Switch to English"}
        >
          {lang.toUpperCase()}
        </button>
        <button
          className="icon-btn"
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
          title={theme === "dark" ? "Light mode" : "Dark mode"}
        >
          {theme === "dark" ? "☀" : "☾"}
        </button>
      </div>
    </header>
  );
};

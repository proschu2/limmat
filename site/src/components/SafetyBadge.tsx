import type { SafetyLevel } from "../lib/types";
import type { Lang } from "../lib/i18n";
import { t } from "../lib/i18n";
import { SAFETY_GLYPH } from "../lib/safety";

interface Props {
  level: SafetyLevel;
  lang: Lang;
  /** Human-readable cause (the "why"), e.g. "Level too low". Falls back to generic desc. */
  reason?: string;
  onExplain: () => void;
}

export const SafetyBadge = ({ level, lang, reason, onExplain }: Props) => {
  const descKey =
    level === "safe"
      ? "safeDesc"
      : level === "caution"
        ? "cautionDesc"
        : "dangerDesc";
  const desc = reason ?? t(lang, descKey);
  return (
    // Button = interactive (tappable). The polite live region wraps it in App
    // so updates are announced without conflicting role on the button itself.
    <button
      className={`badge badge--${level}`}
      onClick={onExplain}
      aria-label={`${t(lang, level)} — ${desc}. ${t(lang, "tapHint")}.`}
    >
      <span className="badge__icon" aria-hidden>
        {SAFETY_GLYPH[level]}
      </span>
      <span>
        <div className="badge__label">{t(lang, level)}</div>
        <div className="badge__desc">{desc}</div>
      </span>
    </button>
  );
};

import type { CurrentConditions, SafetyLevel, Weather } from "../lib/types";
import type { Lang } from "../lib/i18n";
import { t } from "../lib/i18n";
import { fmtNumber, fmtSigned } from "../lib/format";
import { heightSafety, speedSafety, weatherSafety } from "../lib/safety";
import { weatherInfo } from "../lib/weather-codes";
import { WeatherIcon } from "../lib/WeatherIcon";
import { Droplets, Gauge, Ruler } from "lucide-react";

interface Props {
  current: CurrentConditions;
  weather: Weather;
  lang: Lang;
}

interface CardProps {
  label: string;
  value: string;
  unit: string;
  level: SafetyLevel;
  icon?: React.ReactNode;
}

const Card = ({ label, value, unit, level, icon }: CardProps) => (
  <div className="card">
    <div className="card__label">
      {icon}
      {label}
    </div>
    <div className="card__value">
      {value}
      <span className="card__unit">{unit}</span>
    </div>
    <span className={`card__dot dot--${level}`} aria-hidden />
  </div>
);

export const ConditionsGrid = ({ current, weather, lang }: Props) => {
  const airLevel = weatherSafety(weather.currentWeatherCode);
  const waterLevel = "safe"; // no threshold for temp; informational
  const speedLevel = speedSafety(current.waterSpeed);
  const heightLevel = heightSafety(current.waterHeight);
  const wInfo = weatherInfo(weather.currentWeatherCode);

  return (
    <div className="grid">
      <Card
        label={t(lang, "airTemp")}
        value={fmtNumber(lang, weather.currentTemperature, 0)}
        unit={t(lang, "tempUnit")}
        level={airLevel}
        icon={
          <WeatherIcon
            code={weather.currentWeatherCode}
            size={18}
            label={wInfo[lang]}
          />
        }
      />
      <Card
        label={t(lang, "waterTemp")}
        value={fmtNumber(lang, current.waterTemperature, 1)}
        unit={t(lang, "tempUnit")}
        level={waterLevel}
        icon={<Droplets size={18} color="var(--water)" aria-hidden />}
      />
      <Card
        label={t(lang, "speed")}
        value={fmtNumber(lang, current.waterSpeed, 0)}
        unit={t(lang, "speedUnit")}
        level={speedLevel}
        icon={<Gauge size={18} color="var(--water)" aria-hidden />}
      />
      <Card
        label={t(lang, "height")}
        value={fmtSigned(lang, current.waterHeight, 2)}
        unit={t(lang, "heightUnit")}
        level={heightLevel}
        icon={<Ruler size={18} color="var(--water)" aria-hidden />}
      />
    </div>
  );
};

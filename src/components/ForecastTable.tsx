import type { Forecast, Weather } from "../lib/types";
import type { Lang } from "../lib/i18n";
import { t } from "../lib/i18n";
import { fmtWeekday, fmtNumber, fmtSigned } from "../lib/format";
import {
  speedSafety,
  heightSafety,
  dayGrade,
  SAFETY_GLYPH,
} from "../lib/safety";
import { weatherInfo } from "../lib/weather-codes";
import { WeatherIcon } from "../lib/WeatherIcon";

interface Props {
  forecast: Forecast;
  weather: Weather;
  lang: Lang;
}

export const ForecastTable = ({ forecast, weather, lang }: Props) => (
  <div className="table-wrap">
    <table>
      <thead>
        <tr>
          <th className="grade-cell">{t(lang, "gradeCol")}</th>
          <th>{t(lang, "day")}</th>
          <th className="num">{t(lang, "speed")}</th>
          <th className="num">{t(lang, "height")}</th>
          <th className="num">{t(lang, "airCol")}</th>
          <th> </th>
        </tr>
      </thead>
      <tbody>
        {forecast.days.map((d) => {
          const dw = weather.daily[d.date];
          const wCode = dw?.code;
          const wInfo = wCode !== undefined ? weatherInfo(wCode) : null;
          const grade = dayGrade(d.waterHeight, d.waterSpeed, wCode);
          return (
            <tr key={d.date}>
              <td className="grade-cell">
                <span
                  className={`grade-pill grade--${grade}`}
                  role="img"
                  aria-label={t(lang, grade)}
                  title={`${t(lang, grade)}`}
                >
                  {SAFETY_GLYPH[grade]}
                </span>
              </td>
              <td>{fmtWeekday(lang, d.date)}</td>
              <td
                className="num"
                style={{ color: `var(--${speedSafety(d.waterSpeed)})` }}
              >
                {fmtNumber(lang, d.waterSpeed, 0)}
              </td>
              <td
                className="num"
                style={{ color: `var(--${heightSafety(d.waterHeight)})` }}
              >
                {fmtSigned(lang, d.waterHeight, 2)}
              </td>
              <td className="num">
                {dw ? `${fmtNumber(lang, dw.tempMax, 0)}°` : "–"}
              </td>
              <td>
                {wInfo ? (
                  <WeatherIcon code={wCode!} size={20} label={wInfo[lang]} />
                ) : (
                  "–"
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

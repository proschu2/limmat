import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { Forecast, Weather } from "../lib/types";
import type { Lang } from "../lib/i18n";
import { t } from "../lib/i18n";
import { fmtWeekday, fmtNumber } from "../lib/format";
import { weatherInfo } from "../lib/weather-codes";
import { WeatherIcon } from "../lib/WeatherIcon";

interface Props {
  forecast: Forecast;
  weather: Weather;
  lang: Lang;
}

// Custom X-axis tick: weekday label + weather icon stacked, aligned to each
// data point. Rendered inside Recharts' SVG coordinate space.
const WeatherTick =
  (lang: Lang, codes: (number | undefined)[]) =>
  // eslint-disable-next-line react/display-name
  (props: {
    x: number | string;
    y: number | string;
    payload: { value: string };
    index: number;
  }) => {
    const { x, y, payload, index } = props;
    const code = codes[index];
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={6}
          textAnchor="middle"
          fill="var(--text-secondary)"
          fontSize={12}
          fontWeight={600}
        >
          {payload.value}
        </text>
        {code !== undefined && (
          // Nested SVG so the React icon lands at the right spot.
          <svg x={-11} y={14} width={22} height={22} viewBox="0 0 24 24">
            <WeatherIcon
              code={code}
              size={22}
              strokeWidth={2}
              label={weatherInfo(code)[lang]}
            />
          </svg>
        )}
      </g>
    );
  };

export const ForecastChart = ({ forecast, weather, lang }: Props) => {
  const data = forecast.days.map((d) => ({
    day: fmtWeekday(lang, d.date),
    speed: d.waterSpeed,
    height: d.waterHeight,
    weather: weather.daily[d.date], // may be undefined for days beyond forecast range
  }));
  const codes = data.map((d) => d.weather);

  return (
    <div className="chart">
      <div className="chart-legend">
        <span className="legend-item">
          <span
            className="legend-swatch"
            style={{ background: "var(--speed-line)" }}
          />
          {t(lang, "speed")}
        </span>
        <span className="legend-item">
          <span
            className="legend-swatch"
            style={{
              background:
                "repeating-linear-gradient(90deg, var(--height-line) 0 4px, transparent 4px 7px)",
            }}
          />
          {t(lang, "height")}
        </span>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart
          data={data}
          margin={{ top: 8, right: 8, bottom: 28, left: -16 }}
        >
          <CartesianGrid stroke="var(--divider)" strokeDasharray="3 3" />
          <XAxis
            dataKey="day"
            tick={WeatherTick(lang, codes)}
            stroke="var(--divider)"
            // leave room below for the icon row
            interval={0}
            height={52}
          />
          <YAxis
            yAxisId="speed"
            tick={{ fill: "var(--speed-line)", fontSize: 12 }}
            stroke="var(--divider)"
            width={44}
          />
          <YAxis
            yAxisId="height"
            orientation="right"
            tick={{ fill: "var(--height-line)", fontSize: 12 }}
            stroke="var(--divider)"
            width={44}
          />
          <Tooltip
            contentStyle={{
              background: "var(--text)",
              color: "var(--bg)",
              border: "none",
              borderRadius: 8,
            }}
            formatter={(value, name) => {
              const n = Number(value);
              return [
                name === "speed"
                  ? `${fmtNumber(lang, n, 0)} m³/s`
                  : `${fmtNumber(lang, n, 2)} m`,
                name === "speed" ? t(lang, "speed") : t(lang, "height"),
              ];
            }}
          />
          <Line
            yAxisId="speed"
            type="monotone"
            dataKey="speed"
            stroke="var(--speed-line)"
            strokeWidth={2}
            dot={{ r: 3, fill: "var(--speed-line)" }}
            activeDot={{ r: 5 }}
          />
          <Line
            yAxisId="height"
            type="monotone"
            dataKey="height"
            stroke="var(--height-line)"
            strokeWidth={2}
            strokeDasharray="5 4"
            dot={{ r: 3, fill: "var(--height-line)" }}
            activeDot={{ r: 5 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

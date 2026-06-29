// GET /api/forecast — multi-day Limmat forecast (height Δ + flow per day).
import { parseForecast } from "../_lib/parse";
import { corsPreflight, errorJson, json, withCache } from "../_lib/http";

export const onRequestOptions = () => corsPreflight();

export const onRequestGet: PagesFunction = async (context) => {
  try {
    const data = await withCache(context.request, "forecast", parseForecast);
    return json(data);
  } catch (err) {
    console.error("forecast error:", err);
    return errorJson(`Failed to fetch river data: ${String(err)}`);
  }
};

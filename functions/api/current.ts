// GET /api/current — live Limmat conditions (height Δ, flow, water temp).
import { parseCurrent } from "../_lib/parse";
import { corsPreflight, errorJson, json, withCache } from "../_lib/http";

export const onRequestOptions = () => corsPreflight();

export const onRequestGet: PagesFunction = async (context) => {
  try {
    const data = await withCache(context.request, "current", parseCurrent);
    return json(data);
  } catch (err) {
    console.error("current error:", err);
    return errorJson(`Failed to fetch river data: ${String(err)}`);
  }
};

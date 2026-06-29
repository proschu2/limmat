// GET /api/health — simple uptime check.
import { corsPreflight, json } from "../_lib/http";

export const onRequestOptions = () => corsPreflight();

export const onRequestGet: PagesFunction = () =>
  json({ ok: true, time: new Date().toISOString() });

// Offline dev server: serves dist/ + stub /api/* with representative sample
// data, so the app is fully populated without needing hydrodaten.admin.ch
// (which is unreachable from this network). Weather still comes live from
// open-meteo, fetched browser-side.
//
// Bound to 0.0.0.0 so it's reachable over Tailscale (e.g. from a phone) to
// judge UI/styling on a real device.
//
//   bun run build && bun run dev:offline
//
import { createServer } from "http";
import { readFile, stat } from "fs/promises";
import { join, extname } from "path";

const ROOT = join(import.meta.dir, "dist");
const HOST = "0.0.0.0";
const PORT = process.env.PORT ? Number(process.env.PORT) : 8799;

const MIME = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webmanifest": "application/manifest+json",
  ".ico": "image/x-icon",
};

const dayKey = (offset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
};

// Representative sample (within the parser's real value ranges):
// height Δ rising across the week, flow varying, so the chart/badge are lively.
const CURRENT = {
  waterHeight: 0.32,
  waterSpeed: 112,
  waterTemperature: 19.4,
  updatedAt: new Date().toISOString(),
};
const FORECAST = {
  days: [
    { date: dayKey(0), waterHeight: 0.18, waterSpeed: 62 },
    { date: dayKey(1), waterHeight: 0.24, waterSpeed: 58 },
    { date: dayKey(2), waterHeight: 0.33, waterSpeed: 90 },
    { date: dayKey(3), waterHeight: 0.41, waterSpeed: 118 },
    { date: dayKey(4), waterHeight: 0.52, waterSpeed: 148 },
    { date: dayKey(5), waterHeight: 0.61, waterSpeed: 172 },
  ],
  updatedAt: new Date().toISOString(),
};

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${HOST}`);
  const path = decodeURIComponent(url.pathname);

  if (req.method === "OPTIONS") {
    res.writeHead(204, CORS);
    res.end();
    return;
  }

  if (path === "/api/current") {
    res.writeHead(200, { "Content-Type": "application/json", ...CORS });
    res.end(JSON.stringify(CURRENT));
    return;
  }
  if (path === "/api/forecast") {
    res.writeHead(200, { "Content-Type": "application/json", ...CORS });
    res.end(JSON.stringify(FORECAST));
    return;
  }
  if (path === "/api/health") {
    res.writeHead(200, { "Content-Type": "application/json", ...CORS });
    res.end(JSON.stringify({ ok: true, time: new Date().toISOString() }));
    return;
  }

  // Static files
  let fp = join(ROOT, path === "/" ? "/index.html" : path);
  try {
    const s = await stat(fp);
    if (s.isDirectory()) fp = join(fp, "index.html");
    const data = await readFile(fp);
    res.writeHead(200, { "Content-Type": MIME[extname(fp)] || "application/octet-stream" });
    res.end(data);
    return;
  } catch {
    // SPA fallback (so client-side routing never 404s)
    try {
      const data = await readFile(join(ROOT, "index.html"));
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(data);
    } catch {
      res.writeHead(404);
      res.end("Not found. Run `bun run build` first.");
    }
  }
});

server.listen(PORT, HOST, () => {
  console.log(`\n  Limmat offline dev server`);
  console.log(`  ───────────────────────────`);
  console.log(`  local:    http://localhost:${PORT}`);
  console.log(`  tailscale: http://mediateca:${PORT}  (or http://100.69.129.66:${PORT})`);
  console.log(`  data:     sample river data + live open-meteo weather\n`);
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Local dev is run via `wrangler pages dev -- vite`, which serves the site
// (with Vite HMR) AND the /api/* Pages Functions together. No proxy needed —
// /api is served by the same origin in dev and in production.

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // bind 0.0.0.0 so vite is reachable behind pages dev / Tailscale
    allowedHosts: [".ts.net", ".sanziomonti.com", "localhost"],
  },
  build: {
    target: "es2022",
    outDir: "dist",
    sourcemap: false,
  },
});

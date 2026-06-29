// Shared HTTP helpers for Pages Functions: CORS + 30-min edge cache + errors.
// hydrodaten.admin.ch sends NO CORS headers, so the browser can't call it
// directly. These functions fetch server-side and add CORS for our own origin.

const CORS: HeadersInit = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
  Vary: "Origin",
};

export const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=1800", // 30 min, matches edge cache
      ...CORS,
    },
  });

export const corsPreflight = (): Response =>
  new Response(null, { status: 204, headers: CORS });

export const errorJson = (detail: string, status = 502): Response =>
  json({ error: detail }, status);

/**
 * Fetch-or-cache wrapper: 30-min edge cache via the Cache API.
 * Replaces the old Firestore "latest" doc — simpler, edge-native, no DB.
 */
export async function withCache<T>(
  req: Request,
  route: string,
  produce: () => Promise<T>,
): Promise<T> {
  const cache = caches.default;
  // Distinct cache key per route (absolute URL required by the Cache API).
  const key = new Request(`https://lbg-cache.internal/${route}`, req);
  const hit = await cache.match(key);
  if (hit) return (await hit.json()) as T;

  const data = await produce();
  await cache.put(
    key,
    new Response(JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "max-age=1800",
      },
    }),
  );
  return data;
}

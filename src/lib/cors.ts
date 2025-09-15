// src/lib/cors.ts
const ALLOW_ORIGIN = "*";

export function withCORS(init: ResponseInit = {}) {
  return {
    ...init,
    headers: {
      "Access-Control-Allow-Origin": ALLOW_ORIGIN,
      "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      ...(init.headers || {}),
    },
  };
}

export function preflight() {
  return new Response(null, withCORS({ status: 204 }));
}

// Simple CORS helpers for route handlers

export function withCORS(init: ResponseInit = {}): ResponseInit {
  const headers = new Headers(init.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return { ...init, headers };
}

export function preflight() {
  // 204 No Content is typical for preflight
  return new Response(null, withCORS({ status: 204 }));
}

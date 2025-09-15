import { verifyJwt, type JwtPayload } from "@/lib/jwt";

/** Extracts the bearer token from Authorization header */
export function getBearerToken(req: Request): string | null {
  const h = req.headers.get("authorization") || "";
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m ? m[1] : null;
}

/** Returns typed claims or null (does not throw) */
export function getClaims(req: Request): JwtPayload | null {
  const token = getBearerToken(req);
  return token ? verifyJwt<JwtPayload>(token) : null;
}

/**
 * Ensures a valid JWT exists; throws a Response(401) if not.
 * Usage in route handlers:
 *   const claims = requireUser(req);
 */
export function requireUser(req: Request): JwtPayload {
  const claims = getClaims(req);
  if (!claims) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }
  return claims;
}

/**
 * Ensures user is ADMIN; throws 403 otherwise.
 * Usage:
 *   const claims = requireAdmin(req);
 */
export function requireAdmin(req: Request): JwtPayload {
  const claims = requireUser(req);
  if (claims.role !== "ADMIN") {
    throw new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "content-type": "application/json" },
    });
  }
  return claims;
}

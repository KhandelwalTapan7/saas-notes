// src/lib/auth.ts
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

/** A user shape guaranteed to have sub and tenant.id */
export type AuthUser = JwtPayload & {
  sub: string;
  tenant: { id: string; slug?: string; plan?: string };
};

/**
 * Ensures a valid JWT exists *and* includes sub and tenant.id; throws 401 if not.
 * Usage in route handlers:
 *   const user = requireUser(req); // user.sub and user.tenant.id are non-optional
 */
export function requireUser(req: Request): AuthUser {
  const claims = getClaims(req);
  if (!claims || !claims.sub || !claims.tenant?.id) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }
  return claims as AuthUser;
}

/**
 * Ensures user is ADMIN (and has sub, tenant.id); throws 403 otherwise.
 * Usage:
 *   const admin = requireAdmin(req);
 */
export function requireAdmin(req: Request): AuthUser {
  const user = requireUser(req);
  if (user.role !== "ADMIN") {
    throw new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "content-type": "application/json" },
    });
  }
  return user;
}

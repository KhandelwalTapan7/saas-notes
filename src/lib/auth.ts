// src/lib/auth.ts
import { verifyJwt, type JwtPayload } from "@/lib/jwt";

export function getBearerToken(req: Request) {
  const h = req.headers.get("authorization") || "";
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m ? m[1] : null;
}

export function getClaims(req: Request): JwtPayload | null {
  const token = getBearerToken(req);
  return token ? verifyJwt<JwtPayload>(token) : null;
}

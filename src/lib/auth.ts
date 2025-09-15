import { verifyJwt, JwtPayload } from "@/lib/jwt";

export function getBearerToken(req: Request) {
  const h = req.headers.get("authorization") || "";
  if (!h.toLowerCase().startsWith("bearer ")) return undefined;
  return h.slice(7);
}

export function requireUser(req: Request): JwtPayload {
  const payload = verifyJwt(getBearerToken(req));
  if (!payload) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }
  return payload;
}

export function requireAdmin(payload: JwtPayload) {
  if (payload.role !== "ADMIN") {
    throw new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "content-type": "application/json" },
    });
  }
}



// src/lib/client-auth.ts

export interface JwtClaims {
  sub?: string;
  email?: string;
  role?: string; // "ADMIN" | "MEMBER"
  tenant?: {
    id?: string;
    slug?: string;
    plan?: string; // "FREE" | "PRO"
  };
  [key: string]: unknown;
}

function decodeBase64(str: string): string {
  try { if (typeof atob === "function") return atob(str); } catch {}
  return Buffer.from(str, "base64").toString("utf8");
}

export function saveToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("token", token);
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
}

/** Always return a valid Headers object (satisfies HeadersInit) */
export function authHeaders(): Headers {
  const h = new Headers();
  const t = getToken();
  if (t) h.set("Authorization", `Bearer ${t}`);
  return h;
}

export function getJwtClaims(): JwtClaims {
  const t = getToken();
  if (!t) return {};
  try {
    const [, payload] = t.split(".");
    if (!payload) return {};
    const parsed = JSON.parse(decodeBase64(payload));
    return parsed && typeof parsed === "object" ? (parsed as JwtClaims) : {};
  } catch {
    return {};
  }
}

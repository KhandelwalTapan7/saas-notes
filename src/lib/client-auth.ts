// Vercel/SSR safe helpers

function decodeBase64(str: string): string {
  try {
    if (typeof atob === "function") return atob(str); // browser
  } catch {}
  return Buffer.from(str, "base64").toString("utf8"); // node
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

/** Always returns a valid HeadersInit */
export function authHeaders(): Headers {
  const h = new Headers();
  const t = getToken();
  if (t) h.set("Authorization", `Bearer ${t}`);
  return h;
}

export type JwtClaims = Record<string, unknown>;

export function getJwtClaims(): JwtClaims {
  const t = getToken();
  if (!t) return {};
  try {
    const [, payload] = t.split(".");
    if (!payload) return {};
    return JSON.parse(decodeBase64(payload)) as JwtClaims;
  } catch {
    return {};
  }
}

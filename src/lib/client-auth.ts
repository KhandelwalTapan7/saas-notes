export function saveToken(token: string) {
  localStorage.setItem("token", token);
}

export function getToken(): string | null {
  return localStorage.getItem("token");
}

export function clearToken() {
  localStorage.removeItem("token");
}

export function authHeaders() {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export function getJwtClaims(): any {
  const t = getToken();
  if (!t) return {};
  try {
    return JSON.parse(atob(t.split(".")[1]));
  } catch {
    return {};
  }
}

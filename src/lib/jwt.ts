import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) {
  // Don’t crash dev, but make it obvious
  console.warn("⚠️ JWT_SECRET missing in .env");
}

export type JwtPayload = {
  sub: string; // userId
  email: string;
  role: "ADMIN" | "MEMBER";
  tenant: { id: string; slug: string };
};

export function signJwt(payload: JwtPayload, expiresIn = "7d") {
  return jwt.sign(payload, JWT_SECRET || "dev-secret", {
    algorithm: "HS256",
    expiresIn,
  });
}

export function verifyJwt(token?: string): JwtPayload | null {
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET || "dev-secret") as JwtPayload;
  } catch {
    return null;
  }
}

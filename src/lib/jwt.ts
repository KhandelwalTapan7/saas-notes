// src/lib/jwt.ts
import jwt, {
  type JwtPayload as JWTJwtPayload,
  type SignOptions,
  type Algorithm,
} from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

/** App-level claims we add on top of jsonwebtoken's JwtPayload */
export type JwtPayload = JWTJwtPayload & {
  role?: string; // "ADMIN" | "MEMBER"
  tenant?: {
    id?: string;
    slug?: string;
    plan?: string; // "FREE" | "PRO"
  };
};

/** Sign a JWT with proper v9 typings */
export function signJwt(
  payload: JwtPayload,
  expiresIn: SignOptions["expiresIn"] = "7d"
) {
  const options: SignOptions = {
    algorithm: "HS256" as Algorithm,
    expiresIn,
  };
  return jwt.sign(payload, JWT_SECRET, options);
}

/** Verify a JWT and return typed claims or null */
export function verifyJwt<T extends object = JwtPayload>(token: string): T | null {
  try {
    return jwt.verify(token, JWT_SECRET) as T;
  } catch {
    return null;
  }
}

// Optional: re-export the base jsonwebtoken payload type if you need it elsewhere
export type { JWTJwtPayload as JsonWebTokenPayload };

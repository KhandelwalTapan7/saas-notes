import jwt, { type JwtPayload, type SignOptions, type Algorithm } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export function signJwt(
  payload: JwtPayload,
  expiresIn: import('ms').StringValue | number = '7d' as const
) {
  const options: SignOptions = {
    algorithm: 'HS256' as Algorithm,
    expiresIn,
  };
  return jwt.sign(payload, JWT_SECRET, options);
}

export function verifyJwt<T extends object = JwtPayload>(token: string): T | null {
  try {
    return jwt.verify(token, JWT_SECRET) as T;
  } catch {
    return null;
  }
}

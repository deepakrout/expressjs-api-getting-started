import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'changeme';
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN } as jwt.SignOptions);
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, SECRET) as JwtPayload;
}

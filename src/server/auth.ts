import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';

export const JWT_SECRET = process.env.JWT_SECRET || 'travelway_jwt_secret_dev_key_2026';

export interface AuthenticatedUser {
  id: string;
  username: string;
  role: 'main_admin' | 'tour_admin' | 'user';
  name?: string;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

/**
 * Hash password securely using bcrypt
 */
export async function hashPassword(plainText: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainText, salt);
}

/**
 * Compare plain password against bcrypt hash (with legacy plain-text fallback)
 */
export async function comparePassword(plainText: string, hashedOrPlain: string): Promise<boolean> {
  if (!plainText || !hashedOrPlain) return false;
  // If it's a bcrypt hash (starts with $2a$ or $2b$)
  if (hashedOrPlain.startsWith('$2a$') || hashedOrPlain.startsWith('$2b$')) {
    return bcrypt.compare(plainText, hashedOrPlain);
  }
  // Fallback for legacy seeded accounts
  return plainText === hashedOrPlain;
}

/**
 * Issue signed JSON Web Token
 */
export function generateToken(payload: AuthenticatedUser, expiresIn: string = '7d'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions);
}

/**
 * Verify signed JSON Web Token
 */
export function verifyToken(token: string): AuthenticatedUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
  } catch {
    return null;
  }
}

/**
 * Express middleware to authenticate JWT Bearer token
 */
export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.substring(7).trim() 
    : (req.query?.token as string);

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Avtorizatsiya talab qilinadi (Token mavjud emas)"
    });
  }

  const user = verifyToken(token);
  if (!user) {
    return res.status(403).json({
      success: false,
      error: "Token yaroqsiz yoki muddati tugagan"
    });
  }

  req.user = user;
  next();
}

/**
 * Optional authentication middleware - does not block if token is absent
 */
export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.substring(7).trim() 
    : (req.query?.token as string);

  if (token) {
    const user = verifyToken(token);
    if (user) {
      req.user = user;
    }
  }
  next();
}

/**
 * Role-based authorization middleware
 */
export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Avtorizatsiya qilinmagan" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: "Ruxsat berilmagan: Sizning rolingiz ushbu amalni bajarish huquqiga ega emas"
      });
    }
    next();
  };
}

import { describe, it, expect } from 'vitest';
import { 
  hashPassword, 
  comparePassword, 
  generateToken, 
  verifyToken 
} from '../src/server/auth.js';

describe('Authentication & Security Utilities', () => {
  it('should hash password and verify it correctly', async () => {
    const rawPassword = 'StrongPassword2026!';
    const hashed = await hashPassword(rawPassword);

    expect(hashed).toBeDefined();
    expect(hashed).not.toBe(rawPassword);
    expect(hashed.startsWith('$2a$') || hashed.startsWith('$2b$')).toBe(true);

    const isValid = await comparePassword(rawPassword, hashed);
    expect(isValid).toBe(true);

    const isInvalid = await comparePassword('WrongPassword', hashed);
    expect(isInvalid).toBe(false);
  });

  it('should correctly handle legacy unhashed passwords as fallback', async () => {
    const plain = 'legacyPass123';
    const isMatched = await comparePassword('legacyPass123', plain);
    expect(isMatched).toBe(true);

    const isNotMatched = await comparePassword('otherPass', plain);
    expect(isNotMatched).toBe(false);
  });

  it('should generate and verify JWT token successfully', () => {
    const userPayload = {
      id: 'adm-001',
      username: 'admin',
      role: 'main_admin' as const,
      name: 'Super Admin'
    };

    const token = generateToken(userPayload, '1h');
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(3);

    const verified = verifyToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.id).toBe(userPayload.id);
    expect(verified?.username).toBe(userPayload.username);
    expect(verified?.role).toBe(userPayload.role);
  });

  it('should reject invalid or tampered JWT token', () => {
    const verified = verifyToken('invalid.token.structure');
    expect(verified).toBeNull();
  });
});

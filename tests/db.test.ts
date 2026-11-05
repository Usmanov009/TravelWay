import { describe, it, expect } from 'vitest';
import { diagnoseMongoError, getDBStatus } from '../db.js';

describe('MongoDB connection diagnostics', () => {
  it('recognises the Atlas IP allowlist error and points to Network Access', () => {
    const hint = diagnoseMongoError(
      new Error(
        "Could not connect to any servers in your MongoDB Atlas cluster. One common reason is that you're trying to access the database from an IP that isn't whitelisted. Make sure your current IP address is on your Atlas cluster's IP whitelist: https://www.mongodb.com/docs/atlas/security-whitelist/"
      )
    );
    expect(hint).toBeTruthy();
    expect(hint).toContain('Network Access');
  });

  it('recognises authentication failures', () => {
    const hint = diagnoseMongoError(new Error('MongoServerError: bad auth : Authentication failed.'));
    expect(hint).toContain('URL-encode');
  });

  it('recognises DNS / SRV resolution failures', () => {
    const hint = diagnoseMongoError(new Error('querySrv ENOTFOUND _mongodb._tcp.cluster0.mongodb.net'));
    expect(hint).toContain('DNS/SRV');
  });

  it('recognises server selection timeouts (paused cluster)', () => {
    const hint = diagnoseMongoError(new Error('Server selection timed out after 5000 ms'));
    expect(hint).toContain('pauza');
  });

  it('returns null for unknown errors and empty input', () => {
    expect(diagnoseMongoError(new Error('Something else happened'))).toBeNull();
    expect(diagnoseMongoError(null)).toBeNull();
  });

  it('exposes connection state metadata through getDBStatus', () => {
    const status = getDBStatus();
    expect(status.connected).toBe(false);
    expect(typeof status.readyState).toBe('number');
    expect(status).toHaveProperty('lastAttemptAt');
    expect(status).toHaveProperty('hint');
  });
});

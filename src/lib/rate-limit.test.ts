import { describe, expect, it, vi } from 'vitest';
import { rateLimit, resetRateLimit } from './rate-limit';

describe('rateLimit', () => {
  it('allows requests up to the limit, then blocks within the window', () => {
    const key = `test:${Math.random()}`;
    for (let i = 0; i < 3; i += 1) {
      expect(rateLimit(key, 3, 60_000).ok).toBe(true);
    }
    const blocked = rateLimit(key, 3, 60_000);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it('resets the window once it elapses', () => {
    vi.useFakeTimers();
    try {
      const key = `test:${Math.random()}`;
      rateLimit(key, 1, 1_000);
      expect(rateLimit(key, 1, 1_000).ok).toBe(false);
      vi.advanceTimersByTime(1_001);
      expect(rateLimit(key, 1, 1_000).ok).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it('resetRateLimit clears the bucket immediately', () => {
    const key = `test:${Math.random()}`;
    rateLimit(key, 1, 60_000);
    expect(rateLimit(key, 1, 60_000).ok).toBe(false);
    resetRateLimit(key);
    expect(rateLimit(key, 1, 60_000).ok).toBe(true);
  });

  it('tracks independent keys separately', () => {
    const keyA = `test:a:${Math.random()}`;
    const keyB = `test:b:${Math.random()}`;
    expect(rateLimit(keyA, 1, 60_000).ok).toBe(true);
    expect(rateLimit(keyB, 1, 60_000).ok).toBe(true);
    expect(rateLimit(keyA, 1, 60_000).ok).toBe(false);
  });
});

import { headers } from 'next/headers';

/**
 * In-memory fixed-window rate limiter. Good enough for the single-container
 * deployment this app ships with (docker-compose runs one `web` replica —
 * see README "Deploying"); if that ever changes to multiple instances,
 * this needs to move to a shared store (Redis) since each instance would
 * otherwise track its own counters.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

function sweepExpired(now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export interface RateLimitResult {
  ok: boolean;
  retryAfterSeconds: number;
}

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  // Lazy cleanup instead of a timer — keeps this side-effect-free at import
  // time, which matters in a serverless/edge-adjacent runtime.
  if (Math.random() < 0.01) sweepExpired(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSeconds: 0 };
  }

  if (bucket.count >= limit) {
    return { ok: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;
  return { ok: true, retryAfterSeconds: 0 };
}

export function resetRateLimit(key: string) {
  buckets.delete(key);
}

/**
 * Best-effort caller IP for Server Actions. Populated from
 * X-Forwarded-For, which nginx.conf sets on every request it proxies —
 * absent in local `next dev` with no reverse proxy in front of it.
 */
export async function getClientIp(): Promise<string> {
  const headerList = await headers();
  const forwardedFor = headerList.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  const realIp = headerList.get('x-real-ip');
  if (realIp) return realIp.trim();
  return 'unknown';
}

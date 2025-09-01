// Simple in-memory rate limiter for single-instance deployments.
// For multi-instance/serverless, replace with Redis/Upstash.
type Bucket = { tokens: number; last: number };
const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, limit = 10, windowMs = 15_000) {
  const now = Date.now();
  const b = buckets.get(key) ?? { tokens: limit, last: now };
  const elapsed = now - b.last;
  const refill = Math.floor(elapsed / windowMs) * limit;
  b.tokens = Math.min(limit, b.tokens + refill);
  b.last = now;
  if (b.tokens <= 0) {
    buckets.set(key, b);
    return { allowed: false, retryAfter: windowMs - (elapsed % windowMs) };
  }
  b.tokens -= 1;
  buckets.set(key, b);
  return { allowed: true, retryAfter: 0 };
}

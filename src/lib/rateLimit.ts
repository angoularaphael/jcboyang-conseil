interface RateLimitRecord {
  count: number;
  firstAttempt: number;
}

const store = new Map<string, RateLimitRecord>();

export function checkRateLimit(
  key: string,
  maxAttempts = 5,
  windowMs = 60 * 60 * 1000
): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  const record = store.get(key);

  if (!record || now - record.firstAttempt > windowMs) {
    store.set(key, { count: 1, firstAttempt: now });
    return { allowed: true, retryAfterMs: 0 };
  }

  if (record.count >= maxAttempts) {
    return { allowed: false, retryAfterMs: windowMs - (now - record.firstAttempt) };
  }

  record.count++;
  return { allowed: true, retryAfterMs: 0 };
}

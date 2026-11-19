const MAX_RATE_LIMIT_KEYS = 5000;

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export interface RateLimitOptions {
  limit: number;
  windowMs: number;
  now?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

/**
 * Giới hạn tần suất yêu cầu theo khóa (sliding/fixed window bộ nhớ có chặn kích thước tối đa).
 * An toàn bộ nhớ nhờ dọn các khóa hết hạn và giới hạn tối đa 5.000 khóa đang hoạt động.
 */
export function checkRateLimit(
  key: string,
  { limit, windowMs, now = Date.now() }: RateLimitOptions
): RateLimitResult {
  const safeLimit = Math.max(1, Math.trunc(limit));
  const safeWindowMs = Math.max(1000, Math.trunc(windowMs));

  const existing = rateLimitStore.get(key);

  if (existing && existing.resetAt > now) {
    if (existing.count >= safeLimit) {
      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
      };
    }

    existing.count += 1;
    return {
      allowed: true,
      remaining: Math.max(0, safeLimit - existing.count),
      retryAfterSeconds: 0,
    };
  }

  // Khóa cũ đã hết hạn hoặc khóa mới: dọn dẹp nếu bộ đệm đạt ngưỡng
  if (existing) {
    rateLimitStore.delete(key);
  }

  if (rateLimitStore.size >= MAX_RATE_LIMIT_KEYS) {
    for (const [k, entry] of rateLimitStore.entries()) {
      if (entry.resetAt <= now) {
        rateLimitStore.delete(k);
      }
    }
    while (rateLimitStore.size >= MAX_RATE_LIMIT_KEYS) {
      const oldestKey = rateLimitStore.keys().next().value;
      if (oldestKey === undefined) break;
      rateLimitStore.delete(oldestKey);
    }
  }

  rateLimitStore.set(key, {
    count: 1,
    resetAt: now + safeWindowMs,
  });

  return {
    allowed: true,
    remaining: Math.max(0, safeLimit - 1),
    retryAfterSeconds: 0,
  };
}

/** Xóa bộ đệm rate limit trong unit test. */
export function resetRateLimitStoreForTests(): void {
  rateLimitStore.clear();
}

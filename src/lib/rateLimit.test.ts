import { describe, it, expect, beforeEach } from "vitest";
import { checkRateLimit, resetRateLimitStoreForTests } from "./rateLimit";

describe("checkRateLimit", () => {
  beforeEach(() => {
    resetRateLimitStoreForTests();
  });

  it("cho phép các yêu cầu trong ngưỡng và giảm dần remaining", () => {
    const t0 = 1_000_000;
    const first = checkRateLimit("user:a", { limit: 3, windowMs: 60_000, now: t0 });
    const second = checkRateLimit("user:a", { limit: 3, windowMs: 60_000, now: t0 + 100 });
    const third = checkRateLimit("user:a", { limit: 3, windowMs: 60_000, now: t0 + 200 });

    expect(first).toEqual({ allowed: true, remaining: 2, retryAfterSeconds: 0 });
    expect(second).toEqual({ allowed: true, remaining: 1, retryAfterSeconds: 0 });
    expect(third).toEqual({ allowed: true, remaining: 0, retryAfterSeconds: 0 });
  });

  it("chặn khi vượt ngưỡng và trả về retryAfterSeconds dương", () => {
    const t0 = 2_000_000;
    checkRateLimit("tts:1", { limit: 2, windowMs: 30_000, now: t0 });
    checkRateLimit("tts:1", { limit: 2, windowMs: 30_000, now: t0 + 1000 });

    const blocked = checkRateLimit("tts:1", { limit: 2, windowMs: 30_000, now: t0 + 5000 });
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterSeconds).toBe(25);
  });

  it("mở lại bình thường sau khi hết cửa sổ thời gian", () => {
    const t0 = 3_000_000;
    checkRateLimit("dict:1", { limit: 1, windowMs: 10_000, now: t0 });
    expect(checkRateLimit("dict:1", { limit: 1, windowMs: 10_000, now: t0 + 5000 }).allowed).toBe(
      false
    );

    const reset = checkRateLimit("dict:1", { limit: 1, windowMs: 10_000, now: t0 + 10_000 });
    expect(reset).toEqual({ allowed: true, remaining: 0, retryAfterSeconds: 0 });
  });

  it("tách biệt hoàn toàn giữa các khóa khác nhau", () => {
    const t0 = 4_000_000;
    checkRateLimit("feedback:u1", { limit: 1, windowMs: 60_000, now: t0 });
    expect(checkRateLimit("feedback:u1", { limit: 1, windowMs: 60_000, now: t0 }).allowed).toBe(
      false
    );

    const otherUser = checkRateLimit("feedback:u2", { limit: 1, windowMs: 60_000, now: t0 });
    expect(otherUser).toEqual({ allowed: true, remaining: 0, retryAfterSeconds: 0 });
  });
});

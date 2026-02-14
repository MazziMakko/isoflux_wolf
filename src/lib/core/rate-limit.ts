// =====================================================
// RATE LIMITER - Per-org / per-API-key for Reactor API
// In-memory fixed window; production: use Redis or Supabase.
// =====================================================

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 100; // per window per identifier

const store = new Map<string, { count: number; resetAt: number }>();

function getWindowKey(identifier: string): string {
  const now = Date.now();
  const windowStart = Math.floor(now / WINDOW_MS) * WINDOW_MS;
  return `${identifier}:${windowStart}`;
}

export function checkRateLimit(identifier: string): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();
  const key = getWindowKey(identifier);
  const entry = store.get(key);

  if (!entry) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetAt: now + WINDOW_MS };
  }

  if (now >= entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetAt: now + WINDOW_MS };
  }

  entry.count += 1;
  const remaining = Math.max(0, MAX_REQUESTS - entry.count);
  return {
    allowed: entry.count <= MAX_REQUESTS,
    remaining,
    resetAt: entry.resetAt,
  };
}

/** Prune old windows to avoid unbounded growth (call periodically or on each check). */
export function pruneRateLimitStore(): void {
  const now = Date.now();
  for (const [key, value] of store.entries()) {
    if (now >= value.resetAt) store.delete(key);
  }
  if (store.size > 10_000) {
    const entries = [...store.entries()].sort((a, b) => a[1].resetAt - b[1].resetAt);
    entries.slice(0, Math.floor(entries.length / 2)).forEach(([k]) => store.delete(k));
  }
}

type RateLimitRecord = {
  timestamps: number[];
};

// In-memory store for rate limiting
const rateLimitMap = new Map<string, RateLimitRecord>();

/**
 * Checks if a user has exceeded the allowed request limit in a sliding time window.
 * Default is 5 requests per 60 seconds (1 minute).
 */
export function isRateLimited(userId: string, limit = 5, windowMs = 60000): boolean {
  const now = Date.now();
  let record = rateLimitMap.get(userId);

  if (!record) {
    record = { timestamps: [] };
    rateLimitMap.set(userId, record);
  }

  // Remove timestamps outside the sliding window
  record.timestamps = record.timestamps.filter((timestamp) => now - timestamp < windowMs);

  if (record.timestamps.length >= limit) {
    return true;
  }

  // Add the current request timestamp
  record.timestamps.push(now);
  return false;
}

// Periodic garbage collection to prevent memory leaks (runs every 5 minutes)
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    const windowMs = 60000;
    for (const [userId, record] of rateLimitMap.entries()) {
      record.timestamps = record.timestamps.filter((t) => now - t < windowMs);
      if (record.timestamps.length === 0) {
        rateLimitMap.delete(userId);
      }
    }
  }, 5 * 60 * 1000); // 5 minutes
}


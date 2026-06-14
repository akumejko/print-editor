const LIMIT = parseInt(process.env.SAVE_RATE_LIMIT ?? "10", 10);

interface Entry {
  count: number;
  resetAt: number; // Unix ms — midnight of the current day
}

const store = new Map<string, Entry>();

function midnightMs(): number {
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return midnight.getTime();
}

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  let entry = store.get(ip);

  if (!entry || now >= entry.resetAt) {
    entry = { count: 0, resetAt: midnightMs() };
  }

  if (entry.count >= LIMIT) {
    store.set(ip, entry);
    return { allowed: false, remaining: 0 };
  }

  entry.count += 1;
  store.set(ip, entry);
  return { allowed: true, remaining: LIMIT - entry.count };
}

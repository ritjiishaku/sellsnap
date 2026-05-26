import { db } from './db';

export async function rateLimit(
  key: string,
  maxAttempts: number = 5,
  windowMs: number = 60_000
): Promise<{ ok: boolean }> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowMs);

  try {
    const count = await db.rateLimit.count({
      where: { key, createdAt: { gte: windowStart } },
    });

    if (count >= maxAttempts) {
      return { ok: false };
    }

    await db.rateLimit.create({ data: { key } });
    return { ok: true };
  } catch {
    return { ok: true };
  }
}

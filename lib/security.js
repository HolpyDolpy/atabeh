import crypto from 'crypto';
import { prisma } from './db';

export function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export function randomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('base64url');
}

export function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

export function safeText(value, max = 250) {
  return String(value || '').trim().slice(0, max);
}

export function sameOriginOrThrow(request) {
  const origin = request.headers.get('origin');
  if (!origin) return;
  const host = request.headers.get('host');
  const expected = `${process.env.NODE_ENV === 'production' ? 'https' : 'http'}://${host}`;
  if (origin !== expected) throw new Error('Invalid origin');
}

export async function rateLimit(key, { limit = 10, windowMs = 60_000 } = {}) {
  const now = new Date();
  const resetAt = new Date(Date.now() + windowMs);
  return prisma.$transaction(async (tx) => {
    const current = await tx.rateLimit.findUnique({ where: { key } });
    if (!current || current.resetAt <= now) {
      await tx.rateLimit.upsert({
        where: { key },
        update: { count: 1, resetAt },
        create: { key, count: 1, resetAt }
      });
      return { allowed: true, remaining: limit - 1, resetAt };
    }
    if (current.count >= limit) return { allowed: false, remaining: 0, resetAt: current.resetAt };
    const updated = await tx.rateLimit.update({ where: { key }, data: { count: { increment: 1 } } });
    return { allowed: true, remaining: Math.max(0, limit - updated.count), resetAt: updated.resetAt };
  });
}

export function clientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  return (forwarded?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown').trim();
}

import { cookies } from 'next/headers';
import { prisma } from './db';
import { randomToken, sha256 } from './security';

const COOKIE = process.env.SESSION_COOKIE_NAME || 'atabeh_session';
const ttlDays = Number(process.env.SESSION_TTL_DAYS || 14);

export async function createSession(userId, { ipHash, userAgent } = {}) {
  const raw = randomToken(32);
  const tokenHash = sha256(raw);
  const expiresAt = new Date(Date.now() + ttlDays * 86400000);
  await prisma.session.create({ data: { userId, tokenHash, expiresAt, ipHash, userAgent: userAgent?.slice(0, 500) } });
  const jar = await cookies();
  jar.set(COOKIE, raw, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt
  });
}

export async function destroySession() {
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  if (raw) await prisma.session.deleteMany({ where: { tokenHash: sha256(raw) } });
  jar.set(COOKIE, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 0 });
}

export async function getSessionUser() {
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  if (!raw) return null;
  const session = await prisma.session.findUnique({
    where: { tokenHash: sha256(raw) },
    include: { user: true }
  });
  if (!session || session.expiresAt <= new Date()) {
    if (session) await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }
  return session.user;
}

export async function requireAdmin() {
  const user = await getSessionUser();
  if (!user || user.role !== 'ADMIN') return null;
  return user;
}

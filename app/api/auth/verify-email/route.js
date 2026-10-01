import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { hashEmailVerificationToken } from '../../../../lib/email';

export async function GET(request) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  if (!token || token.length < 40) return NextResponse.redirect(new URL('/verify-email?error=invalid', request.url));

  const tokenHash = hashEmailVerificationToken(token);
  const record = await prisma.emailVerificationToken.findUnique({ where:{tokenHash} });
  if (!record || record.expiresAt <= new Date()) {
    if (record) await prisma.emailVerificationToken.delete({where:{id:record.id}}).catch(()=>{});
    return NextResponse.redirect(new URL('/verify-email?error=expired', request.url));
  }

  await prisma.$transaction([
    prisma.user.update({ where:{id:record.userId}, data:{emailVerifiedAt:new Date()} }),
    prisma.emailVerificationToken.deleteMany({ where:{userId:record.userId} })
  ]);
  return NextResponse.redirect(new URL('/login?verified=1', request.url));
}

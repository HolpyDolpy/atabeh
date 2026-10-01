import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '../../../../lib/db';
import { registerSchema } from '../../../../lib/validators';
import { clientIp, normalizeEmail, rateLimit, sameOriginOrThrow, sha256 } from '../../../../lib/security';
import { createEmailVerificationToken, sendVerificationEmail } from '../../../../lib/email';

export async function POST(request) {
  try { sameOriginOrThrow(request); } catch { return NextResponse.json({ error: 'طلب غير مسموح.' }, { status: 403 }); }

  const ip = clientIp(request);
  const ipHash = sha256(ip);
  const ipLimit = await rateLimit(`register:${ipHash}`, { limit: 5, windowMs: 60 * 60 * 1000 });
  if (!ipLimit.allowed) return NextResponse.json({ error: 'محاولات تسجيل كثيرة. حاول مرة أخرى لاحقاً.' }, { status: 429 });

  const form = Object.fromEntries(await request.formData());
  const parsed = registerSchema.safeParse(form);
  if (!parsed.success) {
    const flat = parsed.error.flatten().fieldErrors;
    return NextResponse.json({ error: flat.confirmPassword?.[0] === 'Passwords do not match' ? 'كلمتا المرور غير متطابقتين.' : 'يرجى التأكد من جميع البيانات المدخلة.' }, { status: 400 });
  }

  const email = normalizeEmail(parsed.data.email);
  const emailLimit = await rateLimit(`register-email:${sha256(email)}`, { limit: 3, windowMs: 60 * 60 * 1000 });
  if (!emailLimit.allowed) return NextResponse.json({ error: 'محاولات كثيرة لهذا البريد. حاول لاحقاً.' }, { status: 429 });

  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true, emailVerifiedAt:true } });
  if (existing) return NextResponse.json({ error: existing.emailVerifiedAt ? 'يوجد حساب بهذا البريد بالفعل. جرّب تسجيل الدخول.' : 'يوجد حساب غير مؤكد بهذا البريد. استخدم إعادة إرسال رسالة التأكيد.' }, { status: 409 });

  if (!process.env.RESEND_API_KEY || !process.env.APP_URL) {
    return NextResponse.json({ error: 'خدمة تأكيد البريد لم يتم إعدادها بعد. تواصل مع الإدارة.' }, { status: 503 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  let user;
  try {
    user = await prisma.user.create({ data: { email, name: parsed.data.name.trim(), phone: parsed.data.phone.trim(), passwordHash, role: 'CUSTOMER' } });
    const { token, tokenHash } = createEmailVerificationToken();
    await prisma.emailVerificationToken.create({ data:{ userId:user.id, tokenHash, expiresAt:new Date(Date.now()+30*60*1000) } });
    await sendVerificationEmail({email, name:user.name, token});
    return NextResponse.json({ ok:true, redirectTo:`/verify-email?email=${encodeURIComponent(email)}` });
  } catch (error) {
    if (user?.id) await prisma.user.delete({where:{id:user.id}}).catch(()=>{});
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return NextResponse.json({ error: 'يوجد حساب بهذا البريد بالفعل.' }, { status: 409 });
    if (error?.message === 'EMAIL_SEND_FAILED' || error?.message === 'EMAIL_NOT_CONFIGURED') return NextResponse.json({ error: 'تعذر إرسال رسالة التأكيد. حاول مرة أخرى بعد قليل.' }, { status: 503 });
    console.error(error);
    return NextResponse.json({error:'تعذر إنشاء الحساب حالياً.'},{status:500});
  }
}

import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { createSession } from '../../../../lib/auth';
import { loginSchema } from '../../../../lib/validators';
import { clientIp, normalizeEmail, rateLimit, sameOriginOrThrow, sha256 } from '../../../../lib/security';

export async function POST(request){
  try{sameOriginOrThrow(request);}catch{return NextResponse.json({error:'طلب غير مسموح.'},{status:403})}
  const ip=clientIp(request);
  const rl=await rateLimit(`login:${sha256(ip)}`,{limit:8,windowMs:15*60*1000});
  if(!rl.allowed) return NextResponse.json({error:'محاولات كثيرة. انتظر قليلاً ثم حاول مرة أخرى.'},{status:429});
  const form=Object.fromEntries(await request.formData());
  const parsed=loginSchema.safeParse(form);
  if(!parsed.success) return NextResponse.json({error:'يرجى إدخال بريد إلكتروني صحيح وكلمة مرور من 8 أحرف على الأقل.'},{status:400});
  const email=normalizeEmail(parsed.data.email);
  const user=await prisma.user.findUnique({where:{email}});
  const fallback='$2b$12$zNA9QshEjeGDgZ/vrdUD6OLucit4bQ3uD4KkpS/axYvh46rZP1o4S';
  const ok=await bcrypt.compare(parsed.data.password,user?.passwordHash||fallback);
  if(!user||!ok) return NextResponse.json({error:'البريد الإلكتروني أو كلمة المرور غير صحيحة.'},{status:401});
  if(user.role!=='ADMIN' && !user.emailVerifiedAt) return NextResponse.json({error:'يرجى تأكيد بريدك الإلكتروني أولاً.',code:'EMAIL_NOT_VERIFIED'},{status:403});
  await createSession(user.id,{ipHash:sha256(ip),userAgent:request.headers.get('user-agent')||''});
  return NextResponse.json({ok:true,redirectTo:user.role==='ADMIN'?'/admin':'/account'});
}

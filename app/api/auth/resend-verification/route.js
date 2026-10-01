import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { createEmailVerificationToken, sendVerificationEmail } from '../../../../lib/email';
import { clientIp, normalizeEmail, rateLimit, sameOriginOrThrow, sha256 } from '../../../../lib/security';

export async function POST(request) {
  try { sameOriginOrThrow(request); } catch { return NextResponse.json({error:'طلب غير مسموح.'},{status:403}); }
  const ip=clientIp(request);
  const rl=await rateLimit(`resend-verify:${sha256(ip)}`,{limit:5,windowMs:60*60*1000});
  if(!rl.allowed) return NextResponse.json({error:'محاولات كثيرة. حاول لاحقاً.'},{status:429});
  let body; try{body=await request.json()}catch{return NextResponse.json({error:'بيانات غير صحيحة.'},{status:400})}
  const email=normalizeEmail(body?.email||'');
  if(!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({error:'أدخل بريداً إلكترونياً صحيحاً.'},{status:400});

  const user=await prisma.user.findUnique({where:{email}});
  if(user && !user.emailVerifiedAt){
    const {token,tokenHash}=createEmailVerificationToken();
    await prisma.emailVerificationToken.deleteMany({where:{userId:user.id}});
    await prisma.emailVerificationToken.create({data:{userId:user.id,tokenHash,expiresAt:new Date(Date.now()+30*60*1000)}});
    try{await sendVerificationEmail({email:user.email,name:user.name,token});}
    catch{return NextResponse.json({error:'خدمة البريد غير جاهزة حالياً. حاول لاحقاً.'},{status:503})}
  }
  return NextResponse.json({ok:true,message:'إذا كان الحساب موجوداً وغير مؤكد، أرسلنا رسالة تأكيد جديدة.'});
}

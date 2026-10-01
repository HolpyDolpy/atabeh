import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../../../lib/auth';
import { prisma } from '../../../../../../lib/db';
import { sameOriginOrThrow } from '../../../../../../lib/security';
import { cleanImageValue } from '../../../../../../lib/imageInput';
import { parseCarpetSizeMeters } from '../../../../../../lib/pricing';
export async function POST(request,{params}){
  try{sameOriginOrThrow(request)}catch{return NextResponse.json({error:'طلب غير مسموح.'},{status:403})}
  if(!await requireAdmin())return NextResponse.json({error:'غير مصرح.'},{status:401});
  const {id}=await params;const f=await request.formData();const price=Number(f.get('price')),stock=Number(f.get('stock'));const sku=String(f.get('sku')||'').trim().slice(0,120),size=String(f.get('size')||'').trim().slice(0,80);
  let image=null;try{image=cleanImageValue(f.get('image'),{optional:true})}catch{return NextResponse.json({error:'الصورة غير صالحة أو كبيرة جداً.'},{status:400})}
  if(!sku) return NextResponse.json({error:'يرجى إدخال SKU.'},{status:400});
  if(!parseCarpetSizeMeters(size)) return NextResponse.json({error:'المقاس غير صحيح. استخدم صيغة مثل 2.40x3.30 بالمتر.'},{status:400});
  if(!Number.isFinite(price)||price<0) return NextResponse.json({error:'أدخل سعر متر مربع صحيحاً.'},{status:400});
  if(!Number.isInteger(stock)||stock<0)return NextResponse.json({error:'أدخل مخزوناً صحيحاً.'},{status:400});
  try{await prisma.variant.create({data:{productId:id,sku,size,color:String(f.get('color')||'').trim().slice(0,80)||null,colorHex:String(f.get('colorHex')||'').trim().slice(0,20)||null,pattern:String(f.get('pattern')||'').trim().slice(0,120)||null,image,price,stock,active:true}});return NextResponse.redirect(new URL(`/admin/products/${id}`,request.url),303)}catch{return NextResponse.json({error:'تعذر إضافة المتغير. تأكد أن SKU غير مستخدم.'},{status:400})}
}

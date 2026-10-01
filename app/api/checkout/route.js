import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';
import { checkoutSchema } from '../../../lib/validators';
import { clientIp, rateLimit, sameOriginOrThrow, sha256 } from '../../../lib/security';
import { calculateCarpetPrice } from '../../../lib/pricing';

function orderCode(){return `ATB-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,7).toUpperCase()}`}
export async function POST(request){
  try{sameOriginOrThrow(request);}catch{return NextResponse.json({error:'طلب غير مسموح.'},{status:403})}
  const ip=clientIp(request);const rl=await rateLimit(`checkout:${sha256(ip)}`,{limit:10,windowMs:10*60*1000});if(!rl.allowed)return NextResponse.json({error:'طلبات كثيرة. انتظر قليلاً ثم حاول مرة أخرى.'},{status:429});
  let body;try{body=await request.json()}catch{return NextResponse.json({error:'تعذر قراءة بيانات الطلب.'},{status:400})}
  const parsed=checkoutSchema.safeParse(body);if(!parsed.success)return NextResponse.json({error:'يرجى تعبئة جميع بيانات الطلب المطلوبة بشكل صحيح.'},{status:400});
  try{
    const result=await prisma.$transaction(async tx=>{
      let subtotal=0;const items=[];
      for(const requested of parsed.data.items){
        const variant=await tx.variant.findUnique({where:{id:requested.variantId},include:{product:true}});
        if(!variant||!variant.active||!variant.product.active||variant.productId!==requested.productId) throw new Error('INVALID_ITEM');
        if(variant.stock<requested.quantity) throw new Error('OUT_OF_STOCK');
        const pricing=calculateCarpetPrice(variant.size,variant.price);
        if(!pricing) throw new Error('INVALID_SIZE');
        const unit=pricing.total;const line=Math.round(unit*requested.quantity*100)/100;subtotal+=line;
        items.push({productId:variant.productId,variantId:variant.id,sku:variant.sku,name:variant.product.name,size:variant.size,color:variant.color,pattern:variant.pattern,quantity:requested.quantity,unitPrice:unit,lineTotal:line});
      }
      subtotal=Math.round(subtotal*100)/100;
      const shipping=subtotal>=500?0:25;const total=Math.round((subtotal+shipping)*100)/100;
      const order=await tx.order.create({data:{orderNumber:orderCode(),customerName:parsed.data.customerName,email:parsed.data.email.toLowerCase(),phone:parsed.data.phone,addressLine1:parsed.data.addressLine1,addressLine2:parsed.data.addressLine2||null,city:parsed.data.city,notes:parsed.data.notes||null,subtotal,shipping,total,items:{create:items}}});
      for(const requested of parsed.data.items){await tx.variant.update({where:{id:requested.variantId},data:{stock:{decrement:requested.quantity}}})}
      return order;
    },{isolationLevel:'Serializable'});
    const saved=await prisma.order.findUnique({where:{id:result.id},include:{items:true}});
    return NextResponse.json({
      ok:true,
      orderNumber:result.orderNumber,
      subtotal:Number(result.subtotal),
      shipping:Number(result.shipping),
      total:Number(result.total),
      currency:result.currency || 'ILS',
      items:(saved?.items || []).map(i=>({name:i.name,color:i.color,pattern:i.pattern,size:i.size,quantity:i.quantity,unitPrice:Number(i.unitPrice),lineTotal:Number(i.lineTotal)}))
    });
  }catch(err){
    if(err.message==='OUT_OF_STOCK')return NextResponse.json({error:'أحد المنتجات لم يعد متوفراً بالكمية المطلوبة.'},{status:409});
    if(err.message==='INVALID_SIZE')return NextResponse.json({error:'أحد المقاسات غير صالح للحساب. تواصل مع الإدارة.'},{status:409});
    if(err.message==='INVALID_ITEM')return NextResponse.json({error:'أحد عناصر السلة لم يعد متاحاً.'},{status:409});
    return NextResponse.json({error:'تعذر إنشاء الطلب. حاول مرة أخرى.'},{status:400})
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';
import { checkoutSchema } from '../../../lib/validators';
import { clientIp, rateLimit, sameOriginOrThrow, sha256 } from '../../../lib/security';

function orderCode(){return `ATB-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,7).toUpperCase()}`}
export async function POST(request){
  try{sameOriginOrThrow(request);}catch{return NextResponse.json({error:'Forbidden'},{status:403})}
  const ip=clientIp(request);const rl=await rateLimit(`checkout:${sha256(ip)}`,{limit:10,windowMs:10*60*1000});if(!rl.allowed)return NextResponse.json({error:'Too many requests'},{status:429});
  let body;try{body=await request.json()}catch{return NextResponse.json({error:'Invalid request'},{status:400})}
  const parsed=checkoutSchema.safeParse(body);if(!parsed.success)return NextResponse.json({error:'بيانات الطلب غير صحيحة'},{status:400});
  try{
    const result=await prisma.$transaction(async tx=>{
      let subtotal=0;const items=[];
      for(const requested of parsed.data.items){
        const variant=await tx.variant.findUnique({where:{id:requested.variantId},include:{product:true}});
        if(!variant||!variant.active||!variant.product.active||variant.productId!==requested.productId) throw new Error('INVALID_ITEM');
        if(variant.stock<requested.quantity) throw new Error('OUT_OF_STOCK');
        const unit=Number(variant.price);const line=unit*requested.quantity;subtotal+=line;
        items.push({productId:variant.productId,variantId:variant.id,sku:variant.sku,name:variant.product.name,size:variant.size,color:variant.color,pattern:variant.pattern,quantity:requested.quantity,unitPrice:unit,lineTotal:line});
      }
      const shipping=subtotal>=500?0:25;const total=subtotal+shipping;
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
  }catch(err){if(err.message==='OUT_OF_STOCK')return NextResponse.json({error:'أحد المنتجات لم يعد متوفراً بالكمية المطلوبة'},{status:409});return NextResponse.json({error:'تعذر إنشاء الطلب'},{status:400})}
}

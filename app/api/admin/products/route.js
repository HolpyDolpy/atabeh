import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../lib/auth';
import { prisma } from '../../../../lib/db';
import { productSchema } from '../../../../lib/validators';
import { sameOriginOrThrow } from '../../../../lib/security';
export async function POST(request){
  try{sameOriginOrThrow(request);}catch{return NextResponse.json({error:'Forbidden'},{status:403})}
  const admin=await requireAdmin();if(!admin)return NextResponse.json({error:'Unauthorized'},{status:401});
  const raw=Object.fromEntries(await request.formData());raw.featured=raw.featured==='true';raw.bestseller=raw.bestseller==='true';raw.isNew=raw.isNew==='true';raw.active=true;
  const parsed=productSchema.safeParse(raw);if(!parsed.success)return NextResponse.json({error:'Invalid product data',details:parsed.error.flatten()},{status:400});
  const d=parsed.data;
  try{await prisma.product.create({data:{name:d.name,slug:d.slug,description:d.description,categoryId:d.categoryId,basePrice:d.basePrice,compareAt:d.compareAt===''||d.compareAt==null?null:d.compareAt,image:d.image,gallery:[d.image],featured:!!d.featured,bestseller:!!d.bestseller,isNew:!!d.isNew,active:true}});return NextResponse.redirect(new URL('/admin/products',request.url),303)}catch{return NextResponse.json({error:'Could not create product'},{status:400})}
}

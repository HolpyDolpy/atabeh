import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../../../lib/auth';
import { prisma } from '../../../../../../lib/db';
import { sameOriginOrThrow } from '../../../../../../lib/security';
export async function POST(request,{params}){try{sameOriginOrThrow(request)}catch{return NextResponse.json({error:'Forbidden'},{status:403})}if(!await requireAdmin())return NextResponse.json({error:'Unauthorized'},{status:401});const {id}=await params;const f=await request.formData();const productId=String(f.get('productId')||'');try{const used=await prisma.orderItem.count({where:{variantId:id}});if(used>0)return NextResponse.json({error:'Variant is referenced by an order; disable it instead.'},{status:409});await prisma.variant.delete({where:{id}});return NextResponse.redirect(new URL(`/admin/products/${productId}`,request.url),303)}catch{return NextResponse.json({error:'Could not delete variant'},{status:400})}}

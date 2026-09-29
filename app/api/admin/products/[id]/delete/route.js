import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../../../lib/auth';
import { prisma } from '../../../../../../lib/db';
import { sameOriginOrThrow } from '../../../../../../lib/security';
export async function POST(request,{params}){try{sameOriginOrThrow(request)}catch{return NextResponse.json({error:'Forbidden'},{status:403})}if(!await requireAdmin())return NextResponse.json({error:'Unauthorized'},{status:401});const {id}=await params;try{const count=await prisma.orderItem.count({where:{productId:id}});if(count>0)return NextResponse.json({error:'Cannot delete a product used in existing orders. Hide it instead.'},{status:409});await prisma.product.delete({where:{id}});return NextResponse.redirect(new URL('/admin/products',request.url),303)}catch{return NextResponse.json({error:'Could not delete product'},{status:400})}}

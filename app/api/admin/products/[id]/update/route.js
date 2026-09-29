import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../../../lib/auth';
import { prisma } from '../../../../../../lib/db';
import { sameOriginOrThrow } from '../../../../../../lib/security';

export async function POST(request,{params}){
  try{sameOriginOrThrow(request);}catch{return NextResponse.json({error:'Forbidden'},{status:403})}
  if(!await requireAdmin()) return NextResponse.json({error:'Unauthorized'},{status:401});
  const {id}=await params; const f=await request.formData();
  const gallery=String(f.get('gallery')||'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean).slice(0,20);
  const data={
    name:String(f.get('name')||'').trim().slice(0,120),slug:String(f.get('slug')||'').trim().toLowerCase(),description:String(f.get('description')||'').trim().slice(0,5000),categoryId:String(f.get('categoryId')||''),
    basePrice:Number(f.get('basePrice')||0),compareAt:f.get('compareAt')?Number(f.get('compareAt')):null,image:String(f.get('image')||'').trim().slice(0,800),gallery,
    featured:f.get('featured')==='true',bestseller:f.get('bestseller')==='true',isNew:f.get('isNew')==='true',active:f.get('active')==='true'
  };
  if(!data.name||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug)||!data.categoryId||!Number.isFinite(data.basePrice)||data.basePrice<0) return NextResponse.json({error:'Invalid product data'},{status:400});
  if(!(data.image.startsWith('/')||data.image.startsWith('https://'))) return NextResponse.json({error:'Invalid image'},{status:400});
  try{await prisma.product.update({where:{id},data});return NextResponse.redirect(new URL(`/admin/products/${id}`,request.url),303)}catch(e){return NextResponse.json({error:'Could not update product'},{status:400})}
}

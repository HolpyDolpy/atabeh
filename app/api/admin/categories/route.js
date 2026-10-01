import { NextResponse } from 'next/server';
import {requireAdmin} from '../../../../lib/auth';
import {prisma} from '../../../../lib/db';
import {sameOriginOrThrow} from '../../../../lib/security';
import {cleanImageValue} from '../../../../lib/imageInput';
export async function POST(request){
  try{sameOriginOrThrow(request)}catch{return NextResponse.json({error:'Forbidden'},{status:403})}
  if(!await requireAdmin())return NextResponse.json({error:'Unauthorized'},{status:401});
  const f=await request.formData();
  const name=String(f.get('name')||'').trim().slice(0,100),slug=String(f.get('slug')||'').trim().toLowerCase(),sortOrder=Number(f.get('sortOrder')||0);
  let image=null; try{image=cleanImageValue(f.get('image'),{optional:true})}catch{return NextResponse.json({error:'Invalid or too-large image'},{status:400})}
  if(!name||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)||!Number.isInteger(sortOrder))return NextResponse.json({error:'Invalid category'},{status:400});
  try{await prisma.category.create({data:{name,slug,image,sortOrder,active:true}});return NextResponse.redirect(new URL('/admin/categories',request.url),303)}catch{return NextResponse.json({error:'Could not create category'},{status:400})}
}

import { NextResponse } from 'next/server';
import {requireAdmin} from '../../../../../../lib/auth';
import {prisma} from '../../../../../../lib/db';
import {sameOriginOrThrow} from '../../../../../../lib/security';
import {cleanImageValue} from '../../../../../../lib/imageInput';
export async function POST(request,{params}){
  try{sameOriginOrThrow(request)}catch{return NextResponse.json({error:'Forbidden'},{status:403})}
  if(!await requireAdmin())return NextResponse.json({error:'Unauthorized'},{status:401});
  const {id}=await params;const f=await request.formData();
  let image=null;try{image=cleanImageValue(f.get('image'),{optional:true})}catch{return NextResponse.json({error:'Invalid or too-large image'},{status:400})}
  const data={name:String(f.get('name')||'').trim().slice(0,100),slug:String(f.get('slug')||'').trim().toLowerCase(),image,sortOrder:Number(f.get('sortOrder')||0),active:f.get('active')==='true'};
  if(!data.name||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug)||!Number.isInteger(data.sortOrder))return NextResponse.json({error:'Invalid category'},{status:400});
  try{await prisma.category.update({where:{id},data});return NextResponse.redirect(new URL('/admin/categories',request.url),303)}catch{return NextResponse.json({error:'Could not update category'},{status:400})}
}

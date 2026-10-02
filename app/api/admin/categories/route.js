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
  if(!name||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)||!Number.isInteger(sortOrder))return NextResponse.json({error:'أكمل اسم النوع واكتب Slug صحيحاً مثل turkish.'},{status:400});
  try{
    const created=await prisma.category.create({data:{name,slug,image,sortOrder,active:true}});
    if(request.headers.get('x-requested-with')==='fetch') return NextResponse.json({ok:true,id:created.id});
    return NextResponse.redirect(new URL('/admin/categories',request.url),303);
  }catch(e){
    const msg=e?.code==='P2002'?'يوجد نوع بهذا الاسم أو الـ Slug بالفعل.':'تعذر إضافة النوع. تحقق من البيانات وحاول مرة أخرى.';
    return NextResponse.json({error:msg},{status:400});
  }
}

import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../lib/auth';
import { sameOriginOrThrow } from '../../../../lib/security';
import { cleanImageValue } from '../../../../lib/imageInput';
import { prisma } from '../../../../lib/db';

function cleanText(v,max=500){ return String(v||'').trim().slice(0,max); }
function cleanLink(v){ const x=cleanText(v,600); if(!x) throw new Error('EMPTY_LINK'); if(!x.startsWith('/')&&!x.startsWith('https://')) throw new Error('BAD_LINK'); return x; }
function cleanVideo(v){ const x=cleanText(v,1500); if(!x) throw new Error('EMPTY_VIDEO'); if(!x.startsWith('/')&&!x.startsWith('https://')) throw new Error('BAD_VIDEO'); return x; }
function cleanImageRequired(v){ const x=cleanImageValue(v); if(!x) throw new Error('EMPTY_IMAGE'); return x; }
async function save(key,value){ await prisma.siteSetting.upsert({where:{key},update:{value},create:{key,value}}); }

export async function POST(request){
  try{sameOriginOrThrow(request)}catch{return NextResponse.json({error:'الطلب غير مسموح.'},{status:403})}
  if(!await requireAdmin()) return NextResponse.json({error:'انتهت جلسة الإدارة. سجّل الدخول من جديد.'},{status:401});
  try{
    const f=await request.formData(); const section=String(f.get('section')||'');
    if(section==='hero'){
      const heroVideo=cleanVideo(f.get('heroVideo')); const heroPoster=cleanImageRequired(f.get('heroPoster'));
      await Promise.all([save('heroVideo',heroVideo),save('heroPoster',heroPoster)]);
    }else if(section==='promo'){
      const data={};
      for(const i of [1,2]){
        const title=cleanText(f.get(`promoTitle${i}`),120); if(!title) throw new Error(`EMPTY_TITLE_${i}`);
        data[`promoImage${i}`]=cleanImageRequired(f.get(`promoImage${i}`)); data[`promoTitle${i}`]=title;
        data[`promoText${i}`]=cleanText(f.get(`promoText${i}`),400); data[`promoLink${i}`]=cleanLink(f.get(`promoLink${i}`));
      }
      await Promise.all(Object.entries(data).map(([k,v])=>save(k,v)));
    }else return NextResponse.json({error:'اختر قسماً صحيحاً للحفظ.'},{status:400});
    return NextResponse.json({ok:true});
  }catch(err){
    const m=String(err?.message||'');
    if(m==='EMPTY_VIDEO') return NextResponse.json({error:'أضف فيديو للواجهة الرئيسية أولاً.'},{status:400});
    if(m==='EMPTY_IMAGE') return NextResponse.json({error:'الصورة مطلوبة. اختر صورة قبل الحفظ.'},{status:400});
    if(m.startsWith('EMPTY_TITLE_')) return NextResponse.json({error:'عنوان القسم مطلوب. لا يمكن حفظ قسم فارغ.'},{status:400});
    if(m==='EMPTY_LINK') return NextResponse.json({error:'رابط القسم مطلوب.'},{status:400});
    if(m==='BAD_LINK') return NextResponse.json({error:'الرابط غير صالح. استخدم رابطاً يبدأ بـ / أو https://.'},{status:400});
    if(m==='BAD_VIDEO') return NextResponse.json({error:'رابط الفيديو غير صالح.'},{status:400});
    return NextResponse.json({error:'تعذر حفظ الإعدادات. تحقق من الحقول وحاول مرة أخرى.'},{status:400});
  }
}

import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../lib/auth';
import { sameOriginOrThrow } from '../../../../lib/security';
import { cleanImageValue } from '../../../../lib/imageInput';
import { prisma } from '../../../../lib/db';

function cleanText(v,max=500){ return String(v||'').trim().slice(0,max); }
function cleanLink(v){ const x=cleanText(v,600); if(!x.startsWith('/')&&!x.startsWith('https://')) throw new Error('Bad link'); return x; }
function cleanVideo(v){ const x=cleanText(v,1500); if(!x.startsWith('/')&&!x.startsWith('https://')) throw new Error('Bad video'); return x; }
async function save(key,value){ await prisma.siteSetting.upsert({where:{key},update:{value},create:{key,value}}); }

export async function POST(request){
  try{sameOriginOrThrow(request)}catch{return NextResponse.json({error:'Forbidden'},{status:403})}
  if(!await requireAdmin()) return NextResponse.json({error:'Unauthorized'},{status:401});
  try{
    const f=await request.formData();
    const section=String(f.get('section')||'');
    if(section==='hero'){
      await Promise.all([
        save('heroVideo',cleanVideo(f.get('heroVideo'))),
        save('heroPoster',cleanImageValue(f.get('heroPoster')))
      ]);
    }else if(section==='promo'){
      const data={
        promoImage1:cleanImageValue(f.get('promoImage1')),
        promoTitle1:cleanText(f.get('promoTitle1'),120),
        promoText1:cleanText(f.get('promoText1'),400),
        promoLink1:cleanLink(f.get('promoLink1')),
        promoImage2:cleanImageValue(f.get('promoImage2')),
        promoTitle2:cleanText(f.get('promoTitle2'),120),
        promoText2:cleanText(f.get('promoText2'),400),
        promoLink2:cleanLink(f.get('promoLink2'))
      };
      await Promise.all(Object.entries(data).map(([k,v])=>save(k,v)));
    }else throw new Error('Unknown section');
    return NextResponse.redirect(new URL('/admin/homepage?saved=1',request.url),303);
  }catch{return NextResponse.json({error:'تعذر حفظ إعدادات الصفحة الرئيسية. تأكد من الحقول وحاول مرة أخرى.'},{status:400})}
}

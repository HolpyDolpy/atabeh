'use client';

import { useState } from 'react';
import AdminImagePicker from './AdminImagePicker';
import AdminVideoPicker from './AdminVideoPicker';

function ErrorBox({message}){return message?<div className="form-error" role="alert">{message}</div>:null}
function SuccessBox({message}){return message?<div className="notice success-notice" role="status">{message}</div>:null}

async function saveForm(form){
  const r=await fetch('/api/admin/homepage',{method:'POST',body:new FormData(form),headers:{'x-requested-with':'fetch'}});
  const data=await r.json().catch(()=>({}));
  if(!r.ok) throw new Error(data.error||'تعذر الحفظ. تحقق من الحقول وحاول مرة أخرى.');
  return data;
}

export default function HomepageSettingsForms({settings}){
  const [heroBusy,setHeroBusy]=useState(false), [heroError,setHeroError]=useState(''), [heroSuccess,setHeroSuccess]=useState('');
  const [promoBusy,setPromoBusy]=useState(false), [promoError,setPromoError]=useState(''), [promoSuccess,setPromoSuccess]=useState('');

  async function submitHero(e){
    e.preventDefault(); if(heroBusy) return;
    const f=e.currentTarget, fd=new FormData(f);
    const video=String(fd.get('heroVideo')||'').trim();
    const poster=String(fd.get('heroPoster')||'').trim();
    if(!video){setHeroError('أضف فيديو للواجهة الرئيسية أولاً.');setHeroSuccess('');return}
    if(!poster){setHeroError('أضف صورة غلاف للفيديو حتى لا تظهر مساحة فارغة قبل التشغيل.');setHeroSuccess('');return}
    setHeroBusy(true);setHeroError('');setHeroSuccess('');
    try{await saveForm(f);setHeroSuccess('تم حفظ فيديو الواجهة وصورته بنجاح.')}catch(err){setHeroError(err?.message||'تعذر حفظ فيديو الواجهة.')}finally{setHeroBusy(false)}
  }

  async function submitPromo(e){
    e.preventDefault(); if(promoBusy) return;
    const f=e.currentTarget, fd=new FormData(f);
    for(const i of [1,2]){
      const image=String(fd.get(`promoImage${i}`)||'').trim();
      const title=String(fd.get(`promoTitle${i}`)||'').trim();
      const link=String(fd.get(`promoLink${i}`)||'').trim();
      if(!image){setPromoError(`أضف صورة للقسم ${i===1?'الأول':'الثاني'}.`);setPromoSuccess('');return}
      if(!title){setPromoError(`اكتب عنوان القسم ${i===1?'الأول':'الثاني'}.`);setPromoSuccess('');return}
      if(!link){setPromoError(`أضف رابطاً للقسم ${i===1?'الأول':'الثاني'}.`);setPromoSuccess('');return}
    }
    setPromoBusy(true);setPromoError('');setPromoSuccess('');
    try{await saveForm(f);setPromoSuccess('تم حفظ أقسام الصفحة الرئيسية بنجاح.')}catch(err){setPromoError(err?.message||'تعذر حفظ أقسام الصفحة الرئيسية.')}finally{setPromoBusy(false)}
  }

  return <>
    <div className="admin-card-v6"><h2>فيديو الواجهة الرئيسية</h2>
      <form onSubmit={submitHero} noValidate data-no-global-loading="true"><input type="hidden" name="section" value="hero"/>
        <AdminVideoPicker name="heroVideo" label="فيديو الواجهة الرئيسية" defaultValue={settings.heroVideo}/>
        <AdminImagePicker name="heroPoster" label="صورة الغلاف قبل تشغيل الفيديو" defaultValue={settings.heroPoster}/>
        <ErrorBox message={heroError}/><SuccessBox message={heroSuccess}/>
        <button className="btn btn-primary" type="submit" disabled={heroBusy}>{heroBusy?'جاري الحفظ...':'حفظ الفيديو'}</button>
      </form>
    </div>
    <div className="admin-card-v6"><h2>صور الصفحة الرئيسية</h2><p className="small">كل قسم يحتاج صورة وعنواناً ورابطاً. لن يتم حفظ قسم فارغ.</p>
      <form onSubmit={submitPromo} noValidate data-no-global-loading="true"><input type="hidden" name="section" value="promo"/>
        <div className="admin-home-grid">{[1,2].map(i=><div className="admin-home-panel" key={i}><h3>القسم {i===1?'الأول':'الثاني'}</h3><AdminImagePicker name={`promoImage${i}`} label="الصورة" defaultValue={settings[`promoImage${i}`]}/><div className="field"><label>العنوان</label><input name={`promoTitle${i}`} defaultValue={settings[`promoTitle${i}`]}/></div><div className="field"><label>الوصف</label><textarea name={`promoText${i}`} rows="3" defaultValue={settings[`promoText${i}`]}/></div><div className="field"><label>الرابط</label><input name={`promoLink${i}`} defaultValue={settings[`promoLink${i}`]} placeholder="/shop"/></div></div>)}</div>
        <ErrorBox message={promoError}/><SuccessBox message={promoSuccess}/>
        <button className="btn btn-primary" type="submit" disabled={promoBusy}>{promoBusy?'جاري الحفظ...':'حفظ أقسام الصفحة الرئيسية'}</button>
      </form>
    </div>
  </>;
}

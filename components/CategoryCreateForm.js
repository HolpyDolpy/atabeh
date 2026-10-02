'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminImagePicker from './AdminImagePicker';

export default function CategoryCreateForm(){
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [success,setSuccess]=useState('');
  const [pickerKey,setPickerKey]=useState(0);
  const formRef=useRef(null);
  const router=useRouter();

  async function submit(e){
    e.preventDefault();
    if(busy) return;
    const form=e.currentTarget;
    const fd=new FormData(form);
    const name=String(fd.get('name')||'').trim();
    const slug=String(fd.get('slug')||'').trim();
    if(!name){setError('اكتب اسم النوع أولاً.');form.elements.name?.focus();return}
    if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)){setError('Slug يجب أن يكون أحرفاً إنجليزية صغيرة وأرقاماً وشرطات فقط، مثل turkish.');form.elements.slug?.focus();return}
    setBusy(true);setError('');setSuccess('');
    try{
      const r=await fetch('/api/admin/categories',{method:'POST',body:fd,headers:{'x-requested-with':'fetch'}});
      if(!r.ok){
        const data=await r.json().catch(()=>({}));
        throw new Error(data.error||'تعذر إضافة النوع.');
      }
      form.reset();
      setPickerKey(k=>k+1);
      setSuccess('تمت إضافة النوع بنجاح.');
      router.refresh();
    }catch(err){setError(err?.message||'تعذر إضافة النوع. حاول مرة أخرى.')}finally{setBusy(false)}
  }

  return <form ref={formRef} onSubmit={submit} noValidate data-no-global-loading="true">
    <div className="admin-form-grid">
      <div className="field"><label>اسم النوع / المنشأ</label><input name="name" placeholder="مثال: تركي" disabled={busy}/></div>
      <div className="field"><label>Slug النوع</label><input name="slug" placeholder="turkish" autoCapitalize="none" disabled={busy}/><p className="small">معرف للرابط فقط، مثال: Turkish = turkish</p></div>
      <div className="field"><label>الترتيب</label><input name="sortOrder" type="number" defaultValue="0" disabled={busy}/></div>
      <AdminImagePicker key={pickerKey} name="image" label="صورة النوع"/>
    </div>
    {error&&<div className="form-error" role="alert">{error}</div>}
    {success&&<div className="notice success-notice" role="status">{success}</div>}
    <button className="btn btn-primary" type="submit" disabled={busy} aria-busy={busy}>{busy&&<span className="button-spinner"/>}{busy?'جاري الإضافة...':'إضافة النوع'}</button>
  </form>;
}

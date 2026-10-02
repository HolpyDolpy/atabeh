'use client';

import { useRef, useState } from 'react';
import { upload } from '@vercel/blob/client';

export default function AdminVideoPicker({name='heroVideo', label='فيديو الواجهة', defaultValue=''}) {
  const [value,setValue]=useState(defaultValue||'');
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [progress,setProgress]=useState(0);
  const [showUrl,setShowUrl]=useState(false);
  const inputRef=useRef(null);

  async function onFile(file){
    if(!file) return;
    if(!['video/mp4','video/webm','video/quicktime'].includes(file.type)){
      setError('اختر فيديو MP4 أو WebM أو MOV.');
      return;
    }
    if(file.size>250*1024*1024){
      setError('حجم الفيديو كبير جداً. الحد الأقصى 250MB.');
      return;
    }
    setBusy(true);setError('');setProgress(0);
    try{
      const safe=(file.name||'hero-video').replace(/[^a-zA-Z0-9._-]+/g,'-');
      const blob=await upload(`homepage/${safe}`,file,{
        access:'public',
        handleUploadUrl:'/api/admin/upload/video',
        multipart:true,
        onUploadProgress:({percentage})=>setProgress(Math.round(percentage||0))
      });
      setValue(blob.url);
      setProgress(100);
    }catch(e){
      const msg=String(e?.message||'');
      if(msg.includes('BLOB')||msg.toLowerCase().includes('token')){
        setError('خدمة رفع الفيديو غير مهيأة بشكل صحيح. تحقق من Vercel Blob ثم أعد المحاولة.');
      }else if(msg.includes('مصرح')||msg.toLowerCase().includes('unauthorized')){
        setError('انتهت جلسة الإدارة أو لا تملك الصلاحية. سجّل الدخول من جديد ثم حاول مرة أخرى.');
      }else{
        setError(msg||'تعذر رفع الفيديو. تحقق من الاتصال وحاول مرة أخرى.');
      }
    }finally{setBusy(false)}
  }

  return <div className="field full admin-video-picker">
    <label>{label}</label>
    <input type="hidden" name={name} value={value} required/>
    <div className="admin-image-actions admin-video-actions">
      <button className="btn btn-primary" type="button" onClick={()=>inputRef.current?.click()} disabled={busy}>{busy?`جاري الرفع ${progress}%`:'رفع فيديو من الجهاز'}</button>
      <button className="btn btn-soft" type="button" onClick={()=>setShowUrl(v=>!v)}>{showUrl?'إخفاء الرابط':'استخدام رابط فيديو'}</button>
      {value&&<button className="btn btn-danger" type="button" onClick={()=>{setValue('');setProgress(0)}}>إزالة</button>}
    </div>
    <input ref={inputRef} className="admin-file-input" type="file" accept="video/mp4,video/webm,video/quicktime" onChange={e=>onFile(e.target.files?.[0])}/>
    {busy&&<div className="upload-progress" aria-label={`تم رفع ${progress}%`}><span style={{width:`${progress}%`}}/></div>}
    {showUrl&&<input className="admin-image-url" value={value} onChange={e=>setValue(e.target.value)} placeholder="https://.../video.mp4 أو /videos/hero-loop.mp4"/>}
    {value&&<div className="admin-video-preview"><video src={value} controls muted playsInline preload="metadata"/></div>}
    <p className="small">يفضل MP4 بحجم مناسب للويب. الرفع الكبير يتم مباشرة إلى Vercel Blob حتى لا يعلق الموقع.</p>
    {error&&<p className="inline-warning">{error}</p>}
  </div>;
}

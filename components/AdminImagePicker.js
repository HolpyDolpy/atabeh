'use client';

import { useRef, useState } from 'react';

async function compressImage(file) {
  if (!file || !file.type.startsWith('image/')) throw new Error('يرجى اختيار صورة فقط.');
  if (file.size > 12 * 1024 * 1024) throw new Error('الصورة كبيرة جداً. الحد الأقصى قبل الضغط 12MB.');

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = objectUrl;
    });

    const maxSide = 1600;
    const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
    const width = Math.max(1, Math.round(img.naturalWidth * scale));
    const height = Math.max(1, Math.round(img.naturalHeight * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);

    let dataUrl = canvas.toDataURL('image/webp', 0.80);
    if (!dataUrl.startsWith('data:image/webp')) dataUrl = canvas.toDataURL('image/jpeg', 0.82);
    if (dataUrl.length > 2_000_000) {
      dataUrl = canvas.toDataURL('image/jpeg', 0.68);
    }
    if (dataUrl.length > 2_000_000) throw new Error('الصورة ما زالت كبيرة بعد الضغط. جرّب صورة أصغر.');
    return dataUrl;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export default function AdminImagePicker({ name='image', label='الصورة', defaultValue='', required=false }) {
  const [value, setValue] = useState(defaultValue || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const uploadRef = useRef(null);
  const cameraRef = useRef(null);

  async function onFile(file) {
    if (!file) return;
    setBusy(true); setError('');
    try { setValue(await compressImage(file)); }
    catch (e) { setError(e?.message || 'تعذر معالجة الصورة.'); }
    finally { setBusy(false); }
  }

  const preview = value && (value.startsWith('/') || value.startsWith('https://') || value.startsWith('data:image/'));
  return <div className="field full admin-image-picker">
    <label>{label}</label>
    <input type="hidden" name={name} value={value} required={required}/>
    <div className="admin-image-actions">
      <button className="btn btn-soft" type="button" onClick={()=>uploadRef.current?.click()} disabled={busy}>{busy?'جاري تجهيز الصورة...':'رفع صورة'}</button>
      <button className="btn btn-soft" type="button" onClick={()=>cameraRef.current?.click()} disabled={busy}>التقاط صورة الآن</button>
      {value && <button className="btn btn-danger" type="button" onClick={()=>setValue('')}>إزالة الصورة</button>}
    </div>
    <input ref={uploadRef} className="admin-file-input" type="file" accept="image/*" onChange={e=>onFile(e.target.files?.[0])}/>
    <input ref={cameraRef} className="admin-file-input" type="file" accept="image/*" capture="environment" onChange={e=>onFile(e.target.files?.[0])}/>
    <input className="admin-image-url" value={value.startsWith('data:image/')?'':value} onChange={e=>setValue(e.target.value)} placeholder="أو الصق رابط HTTPS / مسار صورة"/>
    {preview && <div className="admin-image-preview"><img src={value} alt="معاينة الصورة"/></div>}
    <p className="small">على الهاتف زر «التقاط صورة الآن» يفتح الكاميرا الخلفية. يتم ضغط الصورة قبل الإرسال.</p>
    {error && <p className="inline-warning">{error}</p>}
  </div>;
}

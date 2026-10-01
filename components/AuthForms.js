'use client';

import { useMemo, useState } from 'react';

function FieldError({ children }) {
  return children ? <span className="field-error" role="alert">{children}</span> : null;
}

function SubmitButton({ busy, children }) {
  return <button className="btn btn-primary auth-submit" type="submit" disabled={busy} aria-busy={busy}>
    {busy && <span className="button-spinner" aria-hidden="true"/>}{children}
  </button>;
}

export function LoginForm({ verified = false }) {
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');

  async function submit(e) {
    e.preventDefault();
    setMessage('');
    const form = new FormData(e.currentTarget);
    const email = String(form.get('email') || '').trim();
    const password = String(form.get('password') || '');
    const next = {};
    if (!email) next.email = 'يرجى إدخال البريد الإلكتروني.';
    else if (!/^\S+@\S+\.\S+$/.test(email)) next.email = 'أدخل بريداً إلكترونياً صحيحاً.';
    if (!password) next.password = 'يرجى إدخال كلمة المرور.';
    else if (password.length < 8) next.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    try {
      const r = await fetch('/api/auth/login', { method: 'POST', body: form });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        if (data.code === 'EMAIL_NOT_VERIFIED') setMessage('يرجى تأكيد بريدك الإلكتروني أولاً. افتح رسالة التأكيد التي أرسلناها لك.');
        else setMessage(data.error || 'تعذر تسجيل الدخول. حاول مرة أخرى.');
        return;
      }
      window.location.assign(data.redirectTo || '/account');
    } catch {
      setMessage('تعذر الاتصال بالخادم. تحقق من الإنترنت وحاول مرة أخرى.');
    } finally { setBusy(false); }
  }

  return <>
    {verified && <div className="form-success">تم تأكيد بريدك الإلكتروني بنجاح. يمكنك تسجيل الدخول الآن.</div>}
    {message && <div className="form-error" role="alert">{message}</div>}
    <form onSubmit={submit} className="auth-form" noValidate data-no-global-loading="true">
      <div className="field"><label>البريد الإلكتروني</label><input type="email" name="email" autoComplete="email" disabled={busy}/><FieldError>{errors.email}</FieldError></div>
      <div className="field"><label>كلمة المرور</label><input type="password" name="password" autoComplete="current-password" disabled={busy}/><FieldError>{errors.password}</FieldError></div>
      <SubmitButton busy={busy}>{busy ? 'جاري تسجيل الدخول...' : 'دخول'}</SubmitButton>
    </form>
  </>;
}

export function RegisterForm() {
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');

  async function submit(e) {
    e.preventDefault();
    setMessage('');
    const form = new FormData(e.currentTarget);
    const values = Object.fromEntries(form.entries());
    const next = {};
    if (!String(values.name || '').trim()) next.name = 'يرجى إدخال الاسم الكامل.';
    if (!String(values.phone || '').trim()) next.phone = 'يرجى إدخال رقم الهاتف.';
    const email = String(values.email || '').trim();
    if (!email) next.email = 'يرجى إدخال البريد الإلكتروني.';
    else if (!/^\S+@\S+\.\S+$/.test(email)) next.email = 'أدخل بريداً إلكترونياً صحيحاً.';
    if (!values.password) next.password = 'يرجى إنشاء كلمة مرور.';
    else if (String(values.password).length < 8) next.password = 'استخدم 8 أحرف على الأقل.';
    if (!values.confirmPassword) next.confirmPassword = 'يرجى تأكيد كلمة المرور.';
    else if (values.password !== values.confirmPassword) next.confirmPassword = 'كلمتا المرور غير متطابقتين.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    try {
      const r = await fetch('/api/auth/register', { method: 'POST', body: form });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) { setMessage(data.error || 'تعذر إنشاء الحساب. حاول مرة أخرى.'); return; }
      window.location.assign(data.redirectTo || `/verify-email?email=${encodeURIComponent(email)}`);
    } catch {
      setMessage('تعذر الاتصال بالخادم. تحقق من الإنترنت وحاول مرة أخرى.');
    } finally { setBusy(false); }
  }

  return <>
    {message && <div className="form-error" role="alert">{message}</div>}
    <form onSubmit={submit} className="auth-form" noValidate data-no-global-loading="true">
      <div className="field"><label>الاسم الكامل</label><input type="text" name="name" autoComplete="name" disabled={busy}/><FieldError>{errors.name}</FieldError></div>
      <div className="field"><label>رقم الهاتف</label><input type="tel" name="phone" autoComplete="tel" disabled={busy}/><FieldError>{errors.phone}</FieldError></div>
      <div className="field"><label>البريد الإلكتروني</label><input type="email" name="email" autoComplete="email" disabled={busy}/><FieldError>{errors.email}</FieldError></div>
      <div className="field"><label>كلمة المرور</label><input type="password" name="password" autoComplete="new-password" disabled={busy}/><span className="small">8 أحرف على الأقل.</span><FieldError>{errors.password}</FieldError></div>
      <div className="field"><label>تأكيد كلمة المرور</label><input type="password" name="confirmPassword" autoComplete="new-password" disabled={busy}/><FieldError>{errors.confirmPassword}</FieldError></div>
      <SubmitButton busy={busy}>{busy ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب'}</SubmitButton>
    </form>
  </>;
}

export function ResendVerificationForm({ email: initialEmail = '' }) {
  const [email, setEmail] = useState(initialEmail);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const valid = useMemo(() => /^\S+@\S+\.\S+$/.test(email.trim()), [email]);

  async function submit(e) {
    e.preventDefault();
    if (!valid) return setMessage('أدخل بريداً إلكترونياً صحيحاً.');
    setBusy(true); setMessage('');
    try {
      const r = await fetch('/api/auth/resend-verification', { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({email}) });
      const data = await r.json().catch(() => ({}));
      setMessage(data.message || (r.ok ? 'إذا كان الحساب موجوداً وغير مؤكد، أرسلنا رسالة جديدة.' : 'تعذر إرسال الرسالة الآن.'));
    } catch { setMessage('تعذر الاتصال بالخادم. حاول مرة أخرى.'); }
    finally { setBusy(false); }
  }

  return <form onSubmit={submit} className="auth-form verify-resend-form" data-no-global-loading="true">
    <div className="field"><label>البريد الإلكتروني</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} disabled={busy}/></div>
    <button className="btn btn-outline" disabled={busy}>{busy?'جاري الإرسال...':'إعادة إرسال رسالة التأكيد'}</button>
    {message && <div className="notice">{message}</div>}
  </form>;
}

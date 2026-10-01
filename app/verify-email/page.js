import Link from 'next/link';
import { ResendVerificationForm } from '../../components/AuthForms';

export default async function VerifyEmailPage({ searchParams }) {
  const params = await searchParams;
  const email = String(params?.email || '').slice(0,254);
  return <main className="container"><div className="auth-card auth-card-narrow verify-card">
    <img src="/logo.png" alt="Atabeh" className="auth-logo"/>
    <div className="mail-icon">✉</div>
    <h1>أكد بريدك الإلكتروني</h1>
    <p className="auth-intro">أرسلنا رابط تأكيد إلى بريدك. افتح الرسالة واضغط «تأكيد البريد الإلكتروني». الرابط صالح لمدة 30 دقيقة.</p>
    <div className="notice">قد تصل الرسالة خلال دقيقة. تحقق أيضاً من مجلد الرسائل غير المرغوب فيها (Spam).</div>
    <ResendVerificationForm email={email}/>
    <div className="auth-switch"><Link href="/login">العودة إلى تسجيل الدخول</Link></div>
  </div></main>;
}

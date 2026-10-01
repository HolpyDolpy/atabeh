import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser } from '../../lib/auth';
import { LoginForm } from '../../components/AuthForms';

export default async function Login({ searchParams }){
  const user = await getSessionUser();
  if (user) redirect(user.role === 'ADMIN' ? '/admin' : '/account');
  const params = await searchParams;
  const verified = params?.verified === '1';

  return <main className="container"><div className="auth-card auth-card-narrow">
    <img src="/logo.png" alt="Atabeh" className="auth-logo"/>
    <div className="eyebrow">مرحباً بعودتك</div>
    <h1>تسجيل الدخول</h1>
    <p className="auth-intro">ادخل إلى حسابك لمتابعة طلباتك وحفظ بياناتك.</p>
    <LoginForm verified={verified}/>
    <div className="auth-switch"><span>ليس لديك حساب؟</span><Link href="/register">إنشاء حساب جديد</Link></div>
    <div className="auth-switch compact-auth-switch"><span>لم تصلك رسالة التأكيد؟</span><Link href="/verify-email">إعادة الإرسال</Link></div>
    <p className="small auth-security-note">صلاحيات الإدارة لا تظهر إلا للحسابات التي يمنحها الخادم دور المدير.</p>
  </div></main>
}

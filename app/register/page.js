import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser } from '../../lib/auth';
import { RegisterForm } from '../../components/AuthForms';

export default async function Register() {
  const user = await getSessionUser();
  if (user) redirect(user.role === 'ADMIN' ? '/admin' : '/account');

  return <main className="container"><div className="auth-card auth-card-narrow">
    <img src="/logo.png" alt="Atabeh" className="auth-logo" />
    <div className="eyebrow">حساب جديد</div>
    <h1>إنشاء حساب</h1>
    <p className="auth-intro">بعد التسجيل سنرسل رسالة إلى بريدك للتأكد من أن العنوان يعود لك.</p>
    <RegisterForm/>
    <div className="auth-switch"><span>لديك حساب بالفعل؟</span><Link href="/login">تسجيل الدخول</Link></div>
    <p className="small auth-security-note">جميع الحسابات الجديدة تُنشأ كحسابات عملاء. لا يمكن طلب صلاحية الإدارة من صفحة التسجيل.</p>
  </div></main>;
}

import Link from 'next/link';
import { getSessionUser } from '../lib/auth';
import { Icon } from './Icons';

export default async function HeaderAccount(){
  const user=await getSessionUser();
  return <>
    {user?.role==='ADMIN' && <Link className="icon-link admin-only-link" href="/admin" aria-label="الإدارة"><Icon name="grid"/><span>الإدارة</span></Link>}
    <Link className="icon-link" href={user?'/account':'/login'} aria-label="الحساب"><Icon name="user"/><span>{user?'حسابي':'دخول'}</span></Link>
  </>;
}

export function HeaderAccountFallback(){
  return <div className="header-account-skeleton" aria-label="جاري تحميل الحساب"><span/><span/></div>;
}

import Link from 'next/link';
import { Icon } from './Icons';

export default function AdminNav(){
  return <aside className="admin-side">
    <h2>Atabeh Admin</h2>
    <div className="admin-nav-group">الإدارة</div>
    <Link href="/admin"><Icon name="home" size={17}/> لوحة التحكم</Link>
    <Link href="/admin/homepage"><Icon name="home" size={17}/> الصفحة الرئيسية</Link>
    <Link href="/admin/products"><Icon name="grid" size={17}/> المنتجات والمنشورات</Link>
    <Link href="/admin/categories"><Icon name="menu" size={17}/> الأقسام</Link>
    <Link href="/admin/orders"><Icon name="cart" size={17}/> الطلبات</Link>
    <Link href="/admin/users"><Icon name="user" size={17}/> المستخدمون</Link>
    <div className="admin-nav-group">المتجر</div>
    <Link href="/shop"><Icon name="eye" size={17}/> عرض المتجر</Link>
    <Link className="admin-danger-link" href="/logout">تسجيل الخروج</Link>
  </aside>;
}

import Link from 'next/link';
import { prisma } from '../../lib/db';
export default async function AdminHome(){
  const [products,categories,users,orders,pending,revenue,lowStock]=await Promise.all([
    prisma.product.count(),prisma.category.count(),prisma.user.count(),prisma.order.count(),prisma.order.count({where:{status:'PENDING'}}),prisma.order.aggregate({_sum:{total:true},where:{status:{in:['PAID','PROCESSING','SHIPPED','DELIVERED']}}}),prisma.variant.count({where:{active:true,stock:{lte:3}}})
  ]);
  return <><div className="admin-topbar"><div><h1>لوحة التحكم</h1><p className="small">مركز إدارة المتجر بالكامل.</p></div><Link className="btn btn-primary" href="/shop">فتح المتجر</Link></div>
    <div className="admin-summary-grid"><div className="admin-summary-card"><span className="small">المنتجات</span><strong>{products}</strong><Link href="/admin/products">إدارة المنتجات</Link></div><div className="admin-summary-card"><span className="small">الأقسام</span><strong>{categories}</strong><Link href="/admin/categories">إدارة الأقسام</Link></div><div className="admin-summary-card"><span className="small">المستخدمون</span><strong>{users}</strong><Link href="/admin/users">إدارة الحسابات</Link></div><div className="admin-summary-card"><span className="small">الطلبات</span><strong>{orders}</strong><Link href="/admin/orders">إدارة الطلبات</Link></div></div>
    <div className="grid stats"><div className="stat"><div className="small">طلبات معلقة</div><h2>{pending}</h2></div><div className="stat"><div className="small">مخزون منخفض ≤ 3</div><h2>{lowStock}</h2></div><div className="stat"><div className="small">إيراد مسجل</div><h2>{Math.round(Number(revenue._sum.total||0))} ₪</h2></div></div>
    <div className="admin-card-v6"><h2>ما الذي يمكنك التحكم به؟</h2><p>كل منتج منشور يمكن تعديله أو حذفه، مع التحكم بالصور، معرض الصور، اللون، النقشة، المقاس، السعر والمخزون. ويمكنك كذلك إدارة الأقسام، حالات الطلبات، بيانات الطلبات وأدوار المستخدمين.</p><p className="small">جلسات الدخول، Rate Limit وبيانات الأمان الداخلية غير معروضة للتعديل من الواجهة عمداً حتى لا يتم تعطيل حماية الموقع بالخطأ.</p></div>
  </>;
}

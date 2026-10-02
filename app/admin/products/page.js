import Link from 'next/link';
import { prisma } from '../../../lib/db';
import ProductCreateForm from '../../../components/ProductCreateForm';

export default async function ProductsAdmin(){
  const [products,categories] = await Promise.all([
    prisma.product.findMany({include:{category:true,variants:true},orderBy:{updatedAt:'desc'}}),
    prisma.category.findMany({where:{active:true},orderBy:{sortOrder:'asc'}})
  ]);
  return <>
    <div className="admin-topbar"><div><h1>المنتجات والمنشورات</h1><p className="small">الكتالوج يبدأ فارغاً. أنت تضيف المنتجات والمقاسات والصور من لوحة الإدارة.</p></div></div>
    <div className="admin-card-v6"><h2>إضافة منتج جديد</h2>
      {categories.length===0?<div className="inline-warning">أضف نوعاً/قسماً أولاً من صفحة «الأنواع / الأقسام»، ثم ارجع لإنشاء المنتج.</div>:
      <ProductCreateForm categories={categories}/>}
    </div>
    {products.length===0?<div className="admin-card-v6 admin-template-card"><h2>قالب المنتج</h2><div className="admin-template-box">لا توجد منتجات حالياً. بعد إضافة منتج سيظهر هنا مع النوع والسعر وعدد المقاسات/المتغيرات والحالة.</div></div>:
    <div className="table-wrap"><table className="table"><thead><tr><th>المنتج</th><th>النوع</th><th>سعر المتر²</th><th>المقاسات/المتغيرات</th><th>الحالة</th><th>الإجراءات</th></tr></thead><tbody>
      {products.map(p=><tr key={p.id}><td><strong>{p.name}</strong><div className="small">{p.slug}</div></td><td>{p.category.name}</td><td>{Number(p.basePrice)} ₪/م²</td><td>{p.variants.length}</td><td><span className={`admin-badge ${p.active?'active':'inactive'}`}>{p.active?'نشط':'مخفي'}</span></td><td><div className="admin-table-actions"><Link className="btn btn-soft" href={`/admin/products/${p.id}`}>تعديل</Link><form action={`/api/admin/products/${p.id}/delete`} method="post"><button className="btn btn-danger">حذف</button></form></div></td></tr>)}
    </tbody></table></div>}
  </>;
}

import Link from 'next/link';
import { prisma } from '../../../lib/db';
import AdminImagePicker from '../../../components/AdminImagePicker';

export default async function ProductsAdmin(){
  const [products,categories] = await Promise.all([
    prisma.product.findMany({include:{category:true,variants:true},orderBy:{updatedAt:'desc'}}),
    prisma.category.findMany({where:{active:true},orderBy:{sortOrder:'asc'}})
  ]);
  return <>
    <div className="admin-topbar"><div><h1>المنتجات والمنشورات</h1><p className="small">الكتالوج يبدأ فارغاً. أنت تضيف المنتجات والمقاسات والصور من لوحة الإدارة.</p></div></div>
    <div className="admin-card-v6"><h2>إضافة منتج جديد</h2>
      {categories.length===0?<div className="inline-warning">أضف نوعاً/قسماً أولاً من صفحة «الأنواع / الأقسام»، ثم ارجع لإنشاء المنتج.</div>:
      <form action="/api/admin/products" method="post">
        <div className="admin-form-grid">
          <div className="field"><label>الاسم</label><input name="name" required/></div>
          <div className="field"><label>رابط المنتج (Slug)</label><input name="slug" pattern="[a-z0-9-]+" placeholder="super-hilton" required/><span className="small">هذا للرابط فقط، وليس نوع السجاد. النوع/المنشأ تختاره من القائمة.</span></div>
          <div className="field full"><label>الوصف</label><textarea name="description" rows="4"/></div>
          <div className="field"><label>النوع / المنشأ</label><select name="categoryId" required><option value="">اختر النوع</option>{categories.map(c=><option value={c.id} key={c.id}>{c.name}</option>)}</select></div>
          <div className="field"><label>سعر المتر المربع (₪/م²)</label><input type="number" step="0.01" min="0" name="basePrice" required/><span className="small">مثال: إذا كان السعر 40 ₪/م² والمقاس 2.40×3.30 فالسعر النهائي = 316.80 ₪.</span></div>
          <div className="field"><label>سعر سابق للمتر المربع (اختياري)</label><input type="number" step="0.01" min="0" name="compareAt"/></div>
          <AdminImagePicker name="image" label="الصورة الرئيسية — ارفع صورة أو التقطها الآن" required/>
        </div>
        <div className="admin-checkboxes"><label><input type="checkbox" name="featured" value="true"/> مميز</label><label><input type="checkbox" name="bestseller" value="true"/> الأكثر مبيعاً</label><label><input type="checkbox" name="isNew" value="true"/> جديد</label></div>
        <button className="btn btn-primary">إضافة المنتج</button>
      </form>}
    </div>
    {products.length===0?<div className="admin-card-v6 admin-template-card"><h2>قالب المنتج</h2><div className="admin-template-box">لا توجد منتجات حالياً. بعد إضافة منتج سيظهر هنا مع النوع والسعر وعدد المقاسات/المتغيرات والحالة.</div></div>:
    <div className="table-wrap"><table className="table"><thead><tr><th>المنتج</th><th>النوع</th><th>سعر المتر²</th><th>المقاسات/المتغيرات</th><th>الحالة</th><th>الإجراءات</th></tr></thead><tbody>
      {products.map(p=><tr key={p.id}><td><strong>{p.name}</strong><div className="small">{p.slug}</div></td><td>{p.category.name}</td><td>{Number(p.basePrice).toFixed(2)} ₪/م²</td><td>{p.variants.length}</td><td><span className={`admin-badge ${p.active?'active':'inactive'}`}>{p.active?'نشط':'مخفي'}</span></td><td><div className="admin-table-actions"><Link className="btn btn-soft" href={`/admin/products/${p.id}`}>تعديل</Link><form action={`/api/admin/products/${p.id}/delete`} method="post"><button className="btn btn-danger">حذف</button></form></div></td></tr>)}
    </tbody></table></div>}
  </>;
}

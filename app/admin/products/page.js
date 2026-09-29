import Link from 'next/link';
import { prisma } from '../../../lib/db';

export default async function ProductsAdmin(){
  const [products,categories] = await Promise.all([
    prisma.product.findMany({include:{category:true,variants:true},orderBy:{updatedAt:'desc'}}),
    prisma.category.findMany({where:{active:true},orderBy:{sortOrder:'asc'}})
  ]);
  return <>
    <div className="admin-topbar"><div><h1>المنتجات والمنشورات</h1><p className="small">إضافة، تعديل، إخفاء أو حذف أي منتج منشور في المتجر.</p></div></div>
    <div className="admin-card-v6"><h2>إضافة منتج جديد</h2>
      <form action="/api/admin/products" method="post">
        <div className="admin-form-grid">
          <div className="field"><label>الاسم</label><input name="name" required/></div>
          <div className="field"><label>Slug</label><input name="slug" pattern="[a-z0-9-]+" required/></div>
          <div className="field full"><label>الوصف</label><textarea name="description" rows="4"/></div>
          <div className="field"><label>القسم</label><select name="categoryId" required>{categories.map(c=><option value={c.id} key={c.id}>{c.name}</option>)}</select></div>
          <div className="field"><label>السعر الأساسي</label><input type="number" step="0.01" min="0" name="basePrice" required/></div>
          <div className="field"><label>السعر السابق</label><input type="number" step="0.01" min="0" name="compareAt"/></div>
          <div className="field"><label>الصورة الرئيسية</label><input name="image" defaultValue="/images/rug-1.png" required/></div>
        </div>
        <div className="admin-checkboxes"><label><input type="checkbox" name="featured" value="true"/> مميز</label><label><input type="checkbox" name="bestseller" value="true"/> الأكثر مبيعاً</label><label><input type="checkbox" name="isNew" value="true"/> جديد</label></div>
        <button className="btn btn-primary">إضافة المنتج</button>
      </form>
    </div>
    <div className="table-wrap"><table className="table"><thead><tr><th>المنتج</th><th>القسم</th><th>السعر</th><th>المتغيرات</th><th>الحالة</th><th>الإجراءات</th></tr></thead><tbody>
      {products.map(p=><tr key={p.id}><td><strong>{p.name}</strong><div className="small">{p.slug}</div></td><td>{p.category.name}</td><td>{Number(p.basePrice).toFixed(2)} ₪</td><td>{p.variants.length}</td><td><span className={`admin-badge ${p.active?'active':'inactive'}`}>{p.active?'نشط':'مخفي'}</span></td><td><div className="admin-table-actions"><Link className="btn btn-soft" href={`/admin/products/${p.id}`}>تعديل</Link><form action={`/api/admin/products/${p.id}/delete`} method="post"><button className="btn btn-danger">حذف</button></form></div></td></tr>)}
    </tbody></table></div>
  </>;
}

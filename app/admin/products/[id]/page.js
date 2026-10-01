import AdminImagePicker from '../../../../components/AdminImagePicker';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '../../../../lib/db';

export default async function EditProduct({params}){
  const {id}=await params;
  const [product,categories]=await Promise.all([
    prisma.product.findUnique({where:{id},include:{category:true,variants:{orderBy:[{color:'asc'},{pattern:'asc'},{size:'asc'}]}}}),
    prisma.category.findMany({orderBy:{sortOrder:'asc'}})
  ]);
  if(!product) notFound();
  return <>
    <div className="admin-topbar"><div><h1>تعديل: {product.name}</h1><p className="small">تحكم كامل بالمنشور والمتغيرات والمخزون.</p></div><div className="admin-actions"><Link className="btn btn-soft" href={`/product/${product.slug}`}>عرض المنتج</Link><Link className="btn btn-soft" href="/admin/products">رجوع</Link></div></div>

    <div className="admin-card-v6"><h2>بيانات المنتج</h2>
      <form action={`/api/admin/products/${product.id}/update`} method="post">
        <div className="admin-form-grid">
          <div className="field"><label>الاسم</label><input name="name" defaultValue={product.name} required/></div>
          <div className="field"><label>رابط المنتج (Slug)</label><input name="slug" defaultValue={product.slug} pattern="[a-z0-9-]+" required/><span className="small">مثال: super-hilton — النوع مثل «تركي» يتم اختياره من القائمة أدناه.</span></div>
          <div className="field full"><label>الوصف</label><textarea name="description" rows="5" defaultValue={product.description}/></div>
          <div className="field"><label>النوع / المنشأ</label><select name="categoryId" defaultValue={product.categoryId}>{categories.map(c=><option value={c.id} key={c.id}>{c.name}</option>)}</select></div>
          <div className="field"><label>سعر المتر المربع (₪/م²)</label><input type="number" step="0.01" min="0" name="basePrice" defaultValue={Number(product.basePrice)} required/></div>
          <div className="field"><label>سعر سابق للمتر المربع</label><input type="number" step="0.01" min="0" name="compareAt" defaultValue={product.compareAt?Number(product.compareAt):''}/></div>
          <AdminImagePicker name="image" label="الصورة الرئيسية — ارفع أو التقط صورة" defaultValue={product.image} required/>
          <div className="field full"><label>معرض الصور — رابط/مسار في كل سطر</label><textarea name="gallery" rows="5" defaultValue={(product.gallery||[]).join('\n')}/></div>
        </div>
        <div className="admin-checkboxes"><label><input type="checkbox" name="featured" value="true" defaultChecked={product.featured}/> مميز</label><label><input type="checkbox" name="bestseller" value="true" defaultChecked={product.bestseller}/> الأكثر مبيعاً</label><label><input type="checkbox" name="isNew" value="true" defaultChecked={product.isNew}/> جديد</label><label><input type="checkbox" name="active" value="true" defaultChecked={product.active}/> ظاهر في المتجر</label></div>
        <button className="btn btn-primary">حفظ التعديلات</button>
      </form>
    </div>

    <div className="admin-card-v6"><h2>الألوان / النقشات / المقاسات / المخزون</h2>
      {product.variants.length===0?<div className="admin-empty"><strong>قالب المقاسات جاهز.</strong><br/>لا توجد مقاسات مضافة لهذا المنتج. استخدم نموذج «إضافة متغير جديد» بالأسفل لإدخال كل مقاس يدوياً.</div>:product.variants.map(v=><form className="variant-row" action={`/api/admin/variants/${v.id}/update`} method="post" key={v.id}>
        <div className="field"><label>SKU</label><input name="sku" defaultValue={v.sku} required/></div>
        <div className="field"><label>اللون</label><input name="color" defaultValue={v.color||''}/></div>
        <div className="field"><label>النقشة</label><input name="pattern" defaultValue={v.pattern||''}/></div>
        <div className="field"><label>HEX اللون</label><input name="colorHex" defaultValue={v.colorHex||''}/></div>
        <AdminImagePicker name="image" label="صورة هذا الخيار / المقاس" defaultValue={v.image||''}/>
        <div className="field"><label>المقاس بالمتر</label><input name="size" defaultValue={v.size} placeholder="2.40x3.30" required/><span className="small">صيغة العرض × الطول بالمتر.</span></div>
        <div className="field"><label>سعر المتر المربع</label><input type="number" step="0.01" min="0" name="price" defaultValue={Number(v.price)} required/></div>
        <div className="field"><label>المخزون</label><input type="number" min="0" name="stock" defaultValue={v.stock} required/></div>
        <div className="admin-table-actions"><input type="hidden" name="productId" value={product.id}/><label className="small"><input type="checkbox" name="active" value="true" defaultChecked={v.active}/> نشط</label><button className="btn btn-soft">حفظ</button><button className="btn btn-danger" formAction={`/api/admin/variants/${v.id}/delete`}>حذف</button></div>
      </form>)}
    </div>

    <div className="admin-card-v6"><h2>إضافة متغير جديد</h2><form action={`/api/admin/products/${product.id}/variants`} method="post"><div className="admin-form-grid">
      <div className="field"><label>SKU</label><input name="sku" required/></div><div className="field"><label>المقاس بالمتر</label><input name="size" placeholder="مثال: 2.40x3.30" required/><span className="small">سيحسب السعر تلقائياً: العرض × الطول × سعر المتر².</span></div><div className="field"><label>اللون</label><input name="color" placeholder="اختياري"/></div><div className="field"><label>HEX اللون</label><input name="colorHex" placeholder="#8b1e24"/></div><div className="field"><label>النقشة</label><input name="pattern" placeholder="اختياري"/></div><AdminImagePicker name="image" label="صورة هذا المقاس/النوع — رفع أو كاميرا"/><div className="field"><label>سعر المتر المربع</label><input type="number" step="0.01" min="0" name="price" defaultValue={Number(product.basePrice)} required/></div><div className="field"><label>المخزون</label><input type="number" min="0" name="stock" defaultValue="0" required/></div>
    </div><button className="btn btn-primary">إضافة المتغير</button></form></div>

    <div className="admin-card-v6"><h2>منطقة خطرة</h2><p className="inline-warning">حذف المنتج سيحذف متغيراته. إذا كان المنتج مرتبطاً بطلبات قديمة، سيمنع النظام الحذف حتى لا نكسر سجلات الطلبات.</p><form action={`/api/admin/products/${product.id}/delete`} method="post"><button className="btn btn-danger">حذف المنتج نهائياً</button></form></div>
  </>;
}

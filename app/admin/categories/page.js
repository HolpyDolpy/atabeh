import { prisma } from '../../../lib/db';
import AdminImagePicker from '../../../components/AdminImagePicker';
import CategoryCreateForm from '../../../components/CategoryCreateForm';

export default async function CategoriesAdmin(){
  const categories=await prisma.category.findMany({include:{_count:{select:{products:true}}},orderBy:{sortOrder:'asc'}});
  return <><div className="admin-topbar"><div><h1>الأنواع / المنشأ</h1><p className="small">لا توجد أنواع جاهزة. أضف النوع/المنشأ مثل «تركي» أو «إيراني»، وارفع صورة أو التقطها مباشرة من الهاتف.</p></div></div>
    <div className="admin-card-v6"><h2>إضافة نوع جديد</h2><CategoryCreateForm/></div>
    {categories.length===0 && <div className="admin-card-v6 admin-template-card"><h2>قالب النوع</h2><p className="small">سيظهر كل نوع تضيفه هنا بهذا القالب: الاسم، الصورة، الترتيب، حالة الظهور وعدد المنتجات.</p><div className="admin-template-box">لا توجد أنواع مضافة حالياً.</div></div>}
    {categories.map(c=><div className="admin-card-v6" key={c.id}><form action={`/api/admin/categories/${c.id}/update`} method="post"><div className="admin-form-grid"><div className="field"><label>الاسم</label><input name="name" defaultValue={c.name} required/></div><div className="field"><label>Slug</label><input name="slug" defaultValue={c.slug} required/></div><div className="field"><label>الترتيب</label><input name="sortOrder" type="number" defaultValue={c.sortOrder}/></div><AdminImagePicker name="image" label="صورة النوع" defaultValue={c.image||''}/></div><div className="admin-checkboxes"><label><input type="checkbox" name="active" value="true" defaultChecked={c.active}/> ظاهر</label><span className="admin-badge">{c._count.products} منتج</span></div><div className="admin-actions"><button className="btn btn-soft">حفظ</button><button className="btn btn-danger" formAction={`/api/admin/categories/${c.id}/delete`}>حذف</button></div></form></div>)}
  </>;
}

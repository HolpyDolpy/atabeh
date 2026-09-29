import { prisma } from '../../lib/db';
import ProductCard from '../../components/ProductCard';

export default async function Shop({searchParams}){
  const params = await searchParams;
  const category=String(params?.category||'').slice(0,80), filter=String(params?.filter||'').slice(0,20), size=String(params?.size||'').slice(0,40), pattern=String(params?.pattern||'').slice(0,80), q=String(params?.q||'').slice(0,80), sort=String(params?.sort||'featured').slice(0,20);
  const where={active:true};
  if(category) where.category={slug:category};
  if(filter==='new') where.isNew=true;
  if(filter==='best') where.bestseller=true;
  if(q) where.name={contains:q,mode:'insensitive'};
  if(size||pattern) where.variants={some:{active:true,...(size?{size}:{}),...(pattern?{pattern}:{})}};
  const orderBy = sort==='price-asc'?[{basePrice:'asc'}]:sort==='price-desc'?[{basePrice:'desc'}]:sort==='name'?[{name:'asc'}]:[{featured:'desc'},{bestseller:'desc'},{name:'asc'}];
  const [products,categories,rawSizes,rawPatterns]=await Promise.all([
    prisma.product.findMany({where,include:{category:true},orderBy}),
    prisma.category.findMany({where:{active:true},orderBy:{sortOrder:'asc'}}),
    prisma.variant.findMany({where:{active:true},select:{size:true},distinct:['size'],orderBy:{size:'asc'}}),
    prisma.variant.findMany({where:{active:true,pattern:{not:null}},select:{pattern:true},distinct:['pattern'],orderBy:{pattern:'asc'}})
  ]);
  const activeCategory=categories.find(c=>c.slug===category);
  const activeFilters=[q&&`بحث: ${q}`,activeCategory?.name,size&&`مقاس ${size}`,pattern&&pattern,filter==='new'&&'وصل حديثاً',filter==='best'&&'الأكثر طلباً'].filter(Boolean);

  return <main><div className="page-title shop-title shop-title-v5"><div className="container"><span className="eyebrow">Atabeh Royal Carpet</span><h1>{activeCategory?.name||'تسوّق السجاد'}</h1><p>فلترة واضحة، نتائج أسرع، وتفاصيل اللون والنقشة والمقاس قبل الشراء.</p></div></div>
    <section className="section section-v5"><div className="container shop-layout shop-layout-v5">
      <aside className="filters filters-v5"><form><div className="filter-heading"><b>فلترة</b><a href="/shop">مسح الكل</a></div><div className="field"><label>بحث</label><input name="q" defaultValue={q} placeholder="اسم المجموعة..." maxLength={80}/></div><div className="field"><label>القسم</label><select name="category" defaultValue={category}><option value="">كل الأقسام</option>{categories.map(c=><option key={c.id} value={c.slug}>{c.name}</option>)}</select></div><div className="field"><label>المجموعة</label><select name="filter" defaultValue={filter}><option value="">الكل</option><option value="new">وصل حديثاً</option><option value="best">الأكثر طلباً</option></select></div><div className="field"><label>المقاس</label><select name="size" defaultValue={size}><option value="">كل المقاسات</option>{rawSizes.map(v=><option key={v.size} value={v.size}>{v.size}</option>)}</select></div><div className="field"><label>النقشة</label><select name="pattern" defaultValue={pattern}><option value="">كل النقشات</option>{rawPatterns.map(v=><option key={v.pattern} value={v.pattern}>{v.pattern}</option>)}</select></div><input type="hidden" name="sort" value={sort}/><button className="btn btn-primary full" type="submit">عرض النتائج</button></form></aside>
      <div><div className="shop-toolbar shop-toolbar-v5"><div><h2>{products.length} منتج</h2><p className="small">{activeFilters.length?activeFilters.join(' • '):'كل المنتجات المتاحة'}</p></div><form className="sort-form-v5"><input type="hidden" name="q" value={q}/><input type="hidden" name="category" value={category}/><input type="hidden" name="filter" value={filter}/><input type="hidden" name="size" value={size}/><input type="hidden" name="pattern" value={pattern}/><label>ترتيب <select name="sort" defaultValue={sort}><option value="featured">مقترح</option><option value="price-asc">السعر: الأقل</option><option value="price-desc">السعر: الأعلى</option><option value="name">الاسم</option></select></label><button className="btn btn-outline" type="submit">تطبيق</button></form></div>
      {activeFilters.length>0&&<div className="active-filter-chips-v5">{activeFilters.map(x=><span key={x}>{x}</span>)}</div>}
      {products.length?<div className="grid products products-v5">{products.map(p=><ProductCard key={p.id} product={p}/>)}</div>:<div className="empty-state"><h3>لا توجد منتجات مطابقة</h3><p>جرّب إزالة بعض التصفيات.</p><a className="btn btn-primary" href="/shop">عرض كل المنتجات</a></div>}</div>
    </div></section>
  </main>;
}

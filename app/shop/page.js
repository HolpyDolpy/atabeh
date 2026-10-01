import { Suspense } from 'react';
import { prisma } from '../../lib/db';
import ProductCard from '../../components/ProductCard';
import PageSkeleton from '../../components/PageSkeleton';
import { scoreProduct } from '../../lib/fuzzySearch';

async function ShopContent({params}){
  const category=String(params?.category||'').slice(0,80), filter=String(params?.filter||'').slice(0,20), size=String(params?.size||'').slice(0,40), pattern=String(params?.pattern||'').slice(0,80), q=String(params?.q||'').slice(0,80).trim(), sort=String(params?.sort||'featured').slice(0,20);
  const where={active:true};
  if(category) where.category={slug:category};
  if(filter==='new') where.isNew=true;
  if(filter==='best') where.bestseller=true;
  if(size||pattern) where.variants={some:{active:true,...(size?{size}:{}),...(pattern?{pattern}:{})}};
  const orderBy = sort==='price-asc'?[{basePrice:'asc'}]:sort==='price-desc'?[{basePrice:'desc'}]:sort==='name'?[{name:'asc'}]:[{featured:'desc'},{bestseller:'desc'},{name:'asc'}];
  const [baseProducts,categories,variantOptions]=await Promise.all([
    prisma.product.findMany({where,include:{category:true,variants:{where:{active:true},select:{color:true,pattern:true,size:true,sku:true}}},orderBy,take:q?220:60}),
    prisma.category.findMany({where:{active:true},orderBy:{sortOrder:'asc'}}),
    prisma.variant.findMany({where:{active:true},select:{size:true,pattern:true}})
  ]);
  let products=baseProducts;
  let fuzzyUsed=false;
  if(q){
    const ranked=baseProducts.map(product=>({product,score:scoreProduct(product,q)})).filter(x=>x.score>=18).sort((a,b)=>b.score-a.score);
    products=ranked.slice(0,60).map(x=>x.product);
    fuzzyUsed=products.length>0 && !products.some(p=>String(p.name).toLowerCase().includes(q.toLowerCase()));
  }
  const rawSizes=[...new Set(variantOptions.map(v=>v.size).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'ar'));
  const rawPatterns=[...new Set(variantOptions.map(v=>v.pattern).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'ar'));
  const activeCategory=categories.find(c=>c.slug===category);
  const activeFilters=[q&&`بحث: ${q}`,activeCategory?.name,size&&`مقاس ${size}`,pattern&&pattern,filter==='new'&&'وصل حديثاً',filter==='best'&&'الأكثر طلباً'].filter(Boolean);

  return <div className="container shop-layout shop-layout-v5">
    <aside className="filters filters-v5"><form><div className="filter-heading"><b>فلترة النتائج</b><a href="/shop">مسح الكل</a></div><div className="field"><label>بحث</label><div className="filter-search-wrap"><input name="q" defaultValue={q} placeholder="اسم، لون، نقشة..." maxLength={80}/><button type="submit" className="filter-search-button" aria-label="بحث">⌕</button></div><p className="field-hint">لا يلزم كتابة الاسم حرفياً؛ سنحاول عرض أقرب النتائج.</p></div><div className="field"><label>النوع</label><select name="category" defaultValue={category}><option value="">كل الأنواع</option>{categories.map(c=><option key={c.id} value={c.slug}>{c.name}</option>)}</select></div><div className="field"><label>المجموعة</label><select name="filter" defaultValue={filter}><option value="">الكل</option><option value="new">وصل حديثاً</option><option value="best">الأكثر طلباً</option></select></div><div className="field"><label>المقاس</label><select name="size" defaultValue={size}><option value="">كل المقاسات</option>{rawSizes.map(v=><option key={v} value={v}>{v}</option>)}</select></div><div className="field"><label>النقشة</label><select name="pattern" defaultValue={pattern}><option value="">كل النقشات</option>{rawPatterns.map(v=><option key={v} value={v}>{v}</option>)}</select></div><input type="hidden" name="sort" value={sort}/><button className="btn btn-primary full" type="submit">عرض النتائج</button></form></aside>
    <div><div className="shop-toolbar shop-toolbar-v5"><div><h2>{products.length} منتج</h2><p className="small">{activeFilters.length?activeFilters.join(' • '):'كل المنتجات المتاحة'}</p>{q&&fuzzyUsed&&<p className="search-assist">عرضنا لك أقرب النتائج لعبارة «{q}».</p>}</div><form className="sort-form-v5"><input type="hidden" name="q" value={q}/><input type="hidden" name="category" value={category}/><input type="hidden" name="filter" value={filter}/><input type="hidden" name="size" value={size}/><input type="hidden" name="pattern" value={pattern}/><label>ترتيب <select name="sort" defaultValue={sort}><option value="featured">مقترح</option><option value="price-asc">السعر: الأقل</option><option value="price-desc">السعر: الأعلى</option><option value="name">الاسم</option></select></label><button className="btn btn-outline" type="submit">تطبيق</button></form></div>
    {activeFilters.length>0&&<div className="active-filter-chips-v5">{activeFilters.map(x=><span key={x}>{x}</span>)}</div>}
    {products.length?<div className="grid products products-v5">{products.map(p=><ProductCard key={p.id} product={p}/>)}</div>:<div className="empty-state"><div className="empty-icon">⌕</div><h3>ما لقينا نتيجة مطابقة</h3><p>جرّب كلمة أقصر أو اسم النوع أو اللون. البحث يقبل الكلمات القريبة أيضاً.</p><a className="btn btn-primary" href="/shop">عرض كل المنتجات</a></div>}</div>
  </div>;
}

export default async function Shop({searchParams}){
  const params=await searchParams;
  return <main><div className="page-title shop-title shop-title-v5"><div className="container"><span className="eyebrow">Atabeh Royal Carpet</span><h1>تسوّق السجاد</h1><p>ابحث، صفِّ النتائج، ثم افتح المنتج لاختيار المقاس والخيارات والسعر النهائي.</p></div></div><section className="section section-v5"><Suspense fallback={<div className="container"><PageSkeleton kind="filters"/></div>}><ShopContent params={params}/></Suspense></section></main>;
}

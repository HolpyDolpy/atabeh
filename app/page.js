import Link from 'next/link';
import { Suspense } from 'react';
import { prisma } from '../lib/db';
import ProductCard from '../components/ProductCard';
import PageSkeleton from '../components/PageSkeleton';
import { Icon } from '../components/Icons';
import { getHomeSettings } from '../lib/siteSettings';


async function CategorySection(){
  const categories=await prisma.category.findMany({where:{active:true},orderBy:{sortOrder:'asc'},take:6});
  return <section className="section section-v7 category-section-v7"><div className="container">
    <div className="section-head section-head-v7"><div><span className="eyebrow">اكتشف المجموعة</span><h2>ابدأ من النوع الذي يناسب بيتك</h2><p className="section-copy">أقسام واضحة بصرياً تساعدك توصل للخيار المناسب بسرعة.</p></div><Link className="text-link" href="/shop">عرض كل السجاد</Link></div>
    {categories.length?<div className="category-showcase-v7">{categories.map((c,i)=><Link key={c.id} className={`category-tile-v7 ${i===0?'category-tile-v7-featured':''}`} href={`/shop?category=${c.slug}`}><img src={c.image||'/images/rug-1.png'} alt={c.name} loading="lazy" decoding="async"/><div><span>تصفح المجموعة</span><strong>{c.name}</strong></div></Link>)}</div>:<div className="admin-template-box">قالب الأنواع جاهز — ستظهر الأنواع هنا فور إضافتها من لوحة الإدارة.</div>}
  </div></section>;
}

async function BestSection(){
  const best=await prisma.product.findMany({where:{active:true,bestseller:true},include:{category:true},orderBy:{createdAt:'desc'},take:8});
  if(!best.length) return null;
  return <section className="section alt section-v7"><div className="container"><div className="section-head section-head-v7"><div><span className="eyebrow">الأكثر طلباً</span><h2>اختيارات يطلبها الزبائن كثيراً</h2></div><Link className="text-link" href="/shop?filter=best">عرض الكل</Link></div><div className="grid products products-v5">{best.map(p=><ProductCard key={p.id} product={p}/>)}</div></div></section>;
}

async function NewSection(){
  const newItems=await prisma.product.findMany({where:{active:true,isNew:true},include:{category:true},orderBy:{createdAt:'desc'},take:4});
  if(!newItems.length) return null;
  return <section className="section alt section-v7"><div className="container"><div className="section-head section-head-v7"><div><span className="eyebrow">وصل حديثاً</span><h2>جديد المتجر</h2></div><Link className="text-link" href="/shop?filter=new">عرض الكل</Link></div><div className="grid products products-v5">{newItems.map(p=><ProductCard key={p.id} product={p}/>)}</div></div></section>;
}

async function EmptyCatalogHint(){
  const total=await prisma.product.count({where:{active:true}});
  if(total) return null;
  return <div className="container"><div className="admin-template-box">قالب المنتجات جاهز — أضف أول نوع ثم أول منتج ومقاس من لوحة الإدارة.</div></div>;
}

function SectionSkeleton(){ return <section className="section"><PageSkeleton compact/></section>; }

export default async function Home(){
  const home=await getHomeSettings();
  return <main>
    <section className="hero-v7" aria-label="Atabeh Royal Carpet">
      <video className="hero-video-v7" autoPlay muted loop playsInline preload="metadata" poster={home.heroPoster}>
        <source src={home.heroVideo}/>
      </video>
      <div className="hero-overlay-v7"/>
      <div className="container hero-content-v7"><div className="hero-copy-v7"><span className="hero-kicker-v7">Atabeh Royal Carpet</span><h1>السجادة التي تكمل المكان.</h1><p>اختر النوع، اللون، النقشة والمقاس بخطوات واضحة، وشاهد السعر قبل الإضافة للسلة.</p><div className="hero-actions-v7"><Link className="btn btn-primary hero-primary-v7" href="/shop">ابدأ التسوق</Link><Link className="btn hero-ghost-v7" href="/shop?filter=best">الأكثر طلباً</Link></div></div></div>
    </section>

    <Suspense fallback={<SectionSkeleton/>}><CategorySection/></Suspense>
    <Suspense fallback={<SectionSkeleton/>}><BestSection/></Suspense>

    <section className="section section-v7 home-promo-section"><div className="container"><div className="home-promo-grid">
      <Link href={home.promoLink1} className="home-promo-card"><img src={home.promoImage1} alt={home.promoTitle1} loading="lazy" decoding="async"/><div className="home-promo-overlay"><strong>{home.promoTitle1}</strong><span>{home.promoText1}</span></div></Link>
      <Link href={home.promoLink2} className="home-promo-card"><img src={home.promoImage2} alt={home.promoTitle2} loading="lazy" decoding="async"/><div className="home-promo-overlay"><strong>{home.promoTitle2}</strong><span>{home.promoText2}</span></div></Link>
    </div></div></section>

    <section className="section section-v7 compact-v7"><div className="container"><div className="section-head section-head-v7"><div><span className="eyebrow">كيف تختار؟</span><h2>ثلاث خطوات فقط</h2><p className="section-copy">اختر النوع، ثم المقاس والخيارات، وبعدها أضف للسلة أو تواصل معنا مباشرة.</p></div></div><div className="journey-grid"><div><b>1</b><span><strong>اختر النوع</strong><small>ابدأ من القسم أو استخدم البحث.</small></span></div><div><b>2</b><span><strong>حدد المقاس</strong><small>نعرض السعر النهائي حسب المتر المربع.</small></span></div><div><b>3</b><span><strong>أكمل الطلب</strong><small>أضف للسلة أو أرسله عبر واتساب.</small></span></div></div></div></section>

    <Suspense fallback={null}><EmptyCatalogHint/></Suspense>
    <Suspense fallback={<SectionSkeleton/>}><NewSection/></Suspense>

    <section className="section section-v7 trust-section-v7"><div className="container trust-grid-v7"><div><Icon name="shield"/><span><b>ضمان الجودة</b><small>منتجات موثوقة وخيارات واضحة.</small></span></div><div><Icon name="lock"/><span><b>أمان</b><small>بياناتك وطلبك محفوظان بأمان.</small></span></div><div><Icon name="cart"/><span><b>طلب سهل</b><small>اختيار سريع وخطوات واضحة.</small></span></div><div><Icon name="truck"/><span><b>دعم مباشر</b><small>خدمة سريعة عبر واتساب.</small></span></div></div></section>
  </main>;
}

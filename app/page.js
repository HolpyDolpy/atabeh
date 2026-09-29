import Link from 'next/link';
import { prisma } from '../lib/db';
import ProductCard from '../components/ProductCard';
import { Icon } from '../components/Icons';

const roomCards = [
  ['غرفة الجلوس','قطع كبيرة تربط مساحة الجلسة','/shop?size=2*2.80','https://images.unsplash.com/photo-1600166898405-da9535204843?auto=format&fit=crop&fm=jpg&q=78&w=1000'],
  ['غرفة النوم','درجات أهدأ وإحساس دافئ','/shop?category=modern-collections','https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&fm=jpg&q=78&w=1000'],
  ['الممرات والمطبخ','مقاسات عملية للمساحات الطويلة','/shop?category=kitchen-runners','https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&fm=jpg&q=78&w=1000'],
  ['المداخل والزوايا','دائري ومقاسات أصغر','/shop?category=round','https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&fm=jpg&q=78&w=1000']
];

export default async function Home(){
  const [categories,newItems,best,totalProducts] = await Promise.all([
    prisma.category.findMany({where:{active:true},orderBy:{sortOrder:'asc'},take:6}),
    prisma.product.findMany({where:{active:true,isNew:true},include:{category:true},orderBy:{createdAt:'desc'},take:4}),
    prisma.product.findMany({where:{active:true,bestseller:true},include:{category:true},take:8}),
    prisma.product.count({where:{active:true}})
  ]);

  return <main>
    <section className="hero-v7" aria-label="Atabeh Royal Carpet">
      <video className="hero-video-v7" autoPlay muted loop playsInline preload="metadata" poster="/videos/hero-a.jpg">
        <source src="/videos/hero-loop.mp4" type="video/mp4"/>
      </video>
      <div className="hero-overlay-v7"/>
      <div className="container hero-content-v7">
        <div className="hero-copy-v7">
          <span className="hero-kicker-v7">Atabeh Royal Carpet</span>
          <h1>السجادة التي تكمل المكان.</h1>
          <p>تصفّح مجموعاتنا، اختر اللون والنقشة والمقاس، وشاهد كل التفاصيل قبل أن تضيف للسلة.</p>
          <div className="hero-actions-v7"><Link className="btn btn-primary hero-primary-v7" href="/shop">تسوّق السجاد</Link><Link className="btn hero-ghost-v7" href="/shop?filter=best">الأكثر طلباً</Link></div>
          <div className="hero-meta-v7"><span><b>{totalProducts}+</b> مجموعة</span><span>ألوان ونقشات متعددة</span><span>مقاسات متنوعة</span></div>
        </div>
      </div>
    </section>

    <section className="section section-v7 category-section-v7"><div className="container">
      <div className="section-head section-head-v7"><div><span className="eyebrow">اكتشف المجموعة</span><h2>ابدأ من النوع الذي يناسب بيتك</h2><p className="section-copy">أقسام واضحة بصرياً بدون قوائم طويلة أو ازدحام.</p></div><Link className="text-link" href="/shop">عرض كل السجاد</Link></div>
      <div className="category-showcase-v7">{categories.map((c,i)=><Link key={c.id} className={`category-tile-v7 ${i===0?'category-tile-v7-featured':''}`} href={`/shop?category=${c.slug}`}><img src={c.image||'/images/rug-1.png'} alt={c.name}/><div><span>تصفح المجموعة</span><strong>{c.name}</strong></div></Link>)}</div>
    </div></section>

    <section className="section alt section-v7"><div className="container">
      <div className="section-head section-head-v7"><div><span className="eyebrow">الأكثر طلباً</span><h2>اختيارات يطلبها الزبائن كثيراً</h2></div><Link className="text-link" href="/shop?filter=best">عرض الكل</Link></div>
      <div className="grid products products-v5">{best.map(p=><ProductCard key={p.id} product={p}/>)}</div>
    </div></section>

    <section className="section section-v7"><div className="container">
      <div className="section-head section-head-v7"><div><span className="eyebrow">حسب المكان</span><h2>اختار حسب الغرفة</h2><p className="section-copy">طريقة أسرع للوصول للمقاسات والتصاميم المناسبة للمساحة.</p></div></div>
      <div className="room-grid-v7">{roomCards.map(([title,copy,href,image])=><Link key={title} href={href}><img src={image} alt={title}/><div><strong>{title}</strong><span>{copy}</span><em>استكشف ←</em></div></Link>)}</div>
    </div></section>

    <section className="section section-v7 compact-v7"><div className="container size-zone-v7">
      <div><span className="eyebrow">حسب المقاس</span><h2>اختار المقاس مباشرة</h2><p>ابدأ من المقاسات الأكثر استخداماً بدل تصفح منتجات غير مناسبة لمساحتك.</p></div>
      <div className="size-pills-v7"><Link href="/shop?size=1.60*2.30"><b>160 × 230</b><small>متوسط</small></Link><Link href="/shop?size=2*2.80"><b>200 × 280</b><small>غرفة جلوس</small></Link><Link href="/shop?size=2.40*3.30"><b>240 × 330</b><small>كبير</small></Link><Link href="/shop?size=2.80*3.80"><b>280 × 380</b><small>مساحة واسعة</small></Link></div>
    </div></section>

    {newItems.length>0 && <section className="section alt section-v7"><div className="container"><div className="section-head section-head-v7"><div><span className="eyebrow">وصل حديثاً</span><h2>جديد المتجر</h2></div><Link className="text-link" href="/shop?filter=new">عرض الكل</Link></div><div className="grid products products-v5">{newItems.map(p=><ProductCard key={p.id} product={p}/>)}</div></div></section>}

    <section className="section section-v7 trust-section-v7"><div className="container trust-grid-v7"><div><Icon name="search"/><span><b>بحث أوضح</b><small>ابحث بالاسم، اللون، النقشة أو المقاس.</small></span></div><div><Icon name="shield"/><span><b>بيانات محمية</b><small>السعر والمخزون والصلاحيات من الخادم.</small></span></div><div><Icon name="cart"/><span><b>اختيار دقيق</b><small>اللون والنقشة والمقاس محفوظة مع الطلب.</small></span></div><div><Icon name="truck"/><span><b>تواصل مباشر</b><small>واتساب ثابت لمتابعة الطلب بسرعة.</small></span></div></div></section>
  </main>;
}

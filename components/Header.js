import Link from 'next/link';
import { Suspense } from 'react';
import HeaderAccount, { HeaderAccountFallback } from './HeaderAccount';
import { Icon } from './Icons';
import { prisma } from '../lib/db';

export default async function Header(){
  const categories=await prisma.category.findMany({where:{active:true},orderBy:{sortOrder:'asc'},take:10,select:{name:true,slug:true}});
  return <>
    <div className="utilitybar"><div className="container utility-inner">
      <span>توصيل سريع داخل فلسطين</span><span className="utility-sep">•</span><span>دعم مباشر عبر واتساب</span><span className="utility-spacer"/>
    </div></div>

    <header className="header header-v7">
      <div className="container header-main header-main-v7">
        <Link href="/" className="brand brand-v7" aria-label="الصفحة الرئيسية"><img src="/logo.png" alt="Atabeh Royal Carpet"/></Link>

        <form className="site-search site-search-v7" action="/shop" role="search">
          <input name="q" placeholder="ابحث عن سجادة، لون، نقشة أو مقاس..." maxLength={80}/>
          <button className="search-icon-button" type="submit" aria-label="بحث" title="بحث"><Icon name="search" size={20}/></button>
        </form>

        <div className="icon-actions icon-actions-v7">
          <Suspense fallback={<HeaderAccountFallback/>}><HeaderAccount/></Suspense>
          <Link className="icon-link cart-icon-link" href="/cart" aria-label="سلة التسوق"><Icon name="cart"/><span>السلة</span></Link>
        </div>
      </div>

      <div className="navrow navrow-v7"><div className="container navrow-inner navrow-inner-v7">
        <details className="mega mega-v7">
          <summary><Icon name="menu" size={18}/> كل الأقسام</summary>
          <div className="mega-panel mega-panel-v7">
            <div><h4>الأنواع المتاحة</h4>{categories.length?categories.slice(0,5).map(c=><Link key={c.slug} href={`/shop?category=${c.slug}`}>{c.name}</Link>):<span className="small">ستظهر الأنواع هنا بعد إضافتها من الإدارة.</span>}</div>
            <div><h4>المزيد من الأنواع</h4>{categories.slice(5,10).map(c=><Link key={c.slug} href={`/shop?category=${c.slug}`}>{c.name}</Link>)}<Link href="/shop">كل السجاد</Link></div>
            <div><h4>تصفح سريع</h4><Link href="/shop?filter=new">وصل حديثاً</Link><Link href="/shop?filter=best">الأكثر طلباً</Link><Link href="/shop">عرض جميع المنتجات</Link></div>
            <div className="mega-feature mega-feature-v7"><img src="/images/rug-1.png" alt="سجاد فاخر"/><div><strong>اختيار أسهل، تفاصيل أوضح</strong><span>لون، نقشة، مقاس ومخزون في مكان واحد.</span><Link href="/shop">عرض كل السجاد ←</Link></div></div>
          </div>
        </details>

        <nav className="primary-nav primary-nav-v7" aria-label="التنقل الرئيسي">
          <Link className="home-nav-link" href="/"><Icon name="home" size={17}/><span>الرئيسية</span></Link>
          <Link href="/shop">كل السجاد</Link>
          {categories.slice(0,8).map(c=><Link key={c.slug} href={`/shop?category=${c.slug}`}>{c.name}</Link>)}
        </nav>
      </div></div>
    </header>
  </>;
}

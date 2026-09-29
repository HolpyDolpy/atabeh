import Link from 'next/link';
import { getSessionUser } from '../lib/auth';
import { Icon } from './Icons';

const mainCategories = [
  ['مصري','egyptian'],
  ['بلجيكي وحرير','belgian-silk'],
  ['تركي','turkish'],
  ['صوف','wool'],
  ['مودرن','modern-collections'],
  ['كلاسيك','royal-classic'],
  ['ممرات','kitchen-runners'],
  ['دائري','round']
];

export default async function Header(){
  const user = await getSessionUser();

  return <>
    <div className="utilitybar"><div className="container utility-inner">
      <span>توصيل سريع داخل فلسطين</span><span className="utility-sep">•</span><span>دعم مباشر عبر واتساب</span><span className="utility-spacer"/>
      <Link href="/shop?filter=new">وصل حديثاً</Link><Link href="/shop?filter=best">الأكثر طلباً</Link>
    </div></div>

    <header className="header header-v7">
      <div className="container header-main header-main-v7">
        <Link href="/" className="brand brand-v7"><img src="/logo.png" alt="Atabeh Royal Carpet"/></Link>

        <form className="site-search site-search-v7" action="/shop" role="search">
          <Icon name="search" size={19}/>
          <input name="q" placeholder="ابحث عن سجادة، لون، نقشة أو مقاس..." maxLength={80}/>
          <button type="submit">بحث</button>
        </form>

        <div className="icon-actions icon-actions-v7">
          {user?.role==='ADMIN' && <Link className="icon-link admin-only-link" href="/admin" aria-label="الإدارة"><Icon name="grid"/><span>الإدارة</span></Link>}
          <Link className="icon-link" href={user?'/account':'/login'} aria-label="الحساب"><Icon name="user"/><span>{user?'حسابي':'دخول'}</span></Link>
          <Link className="icon-link cart-icon-link" href="/cart" aria-label="سلة التسوق"><Icon name="cart"/><span>السلة</span></Link>
        </div>
      </div>

      <div className="navrow navrow-v7"><div className="container navrow-inner navrow-inner-v7">
        <details className="mega mega-v7">
          <summary><Icon name="menu" size={18}/> كل الأقسام</summary>
          <div className="mega-panel mega-panel-v7">
            <div><h4>حسب المنشأ والخامة</h4><Link href="/shop?category=egyptian">سجاد مصري</Link><Link href="/shop?category=belgian-silk">بلجيكي وحرير</Link><Link href="/shop?category=turkish">تركي</Link><Link href="/shop?category=wool">صوف</Link></div>
            <div><h4>حسب الاستخدام</h4><Link href="/shop?category=kitchen-runners">مطبخ وممرات</Link><Link href="/shop?category=round">دائري</Link><Link href="/shop?category=rolls">رول وموكيت</Link><Link href="/shop?category=flooring-pvc">PVC وأرضيات</Link></div>
            <div><h4>حسب الستايل</h4><Link href="/shop?category=royal-classic">رويال وكلاسيك</Link><Link href="/shop?category=modern-collections">مودرن</Link><Link href="/shop?filter=new">وصل حديثاً</Link><Link href="/shop?filter=best">الأكثر طلباً</Link></div>
            <div className="mega-feature mega-feature-v7"><img src="https://images.unsplash.com/photo-1600166898405-da9535204843?auto=format&fit=crop&fm=jpg&q=78&w=900" alt="سجاد فاخر"/><div><strong>اختيار أسهل، تفاصيل أوضح</strong><span>لون، نقشة، مقاس ومخزون في مكان واحد.</span><Link href="/shop">عرض كل السجاد ←</Link></div></div>
          </div>
        </details>

        <nav className="primary-nav primary-nav-v7" aria-label="التنقل الرئيسي">
          <Link href="/shop">كل السجاد</Link>
          {mainCategories.map(([label,slug])=><Link key={slug} href={`/shop?category=${slug}`}>{label}</Link>)}
          <Link className="sale-link" href="/shop?filter=best">الأكثر طلباً</Link>
        </nav>
      </div></div>
    </header>
  </>;
}

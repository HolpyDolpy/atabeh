import Link from 'next/link';
import { Icon } from './Icons';
export default function Footer(){return <>
  <section className="trust-strip"><div className="container trust-grid">
    <div><Icon name="truck"/><span><b>توصيل سريع</b><small>خيارات توصيل واضحة عند الطلب</small></span></div>
    <div><Icon name="rotate"/><span><b>خدمة ما بعد البيع</b><small>دعم للاستبدال والاستفسارات</small></span></div>
    <div><Icon name="lock"/><span><b>بياناتك محمية</b><small>لا نخزن بيانات بطاقات الدفع</small></span></div>
    <div><Icon name="shield"/><span><b>شراء موثوق</b><small>أسعار ومخزون يتحقق منهما الخادم</small></span></div>
  </div></section>
  <footer className="footer"><div className="container footer-grid">
    <div className="footer-brand"><img src="/logo.png" alt="Atabeh Royal Carpet"/><p>سجاد أصيل لمنازل أجمل. سجاد، موكيت، قطع يدوية وحلول أرضيات.</p></div>
    <div><h3>التسوق</h3><p><Link href="/shop">كل المنتجات</Link></p><p><Link href="/shop?filter=new">وصل حديثاً</Link></p><p><Link href="/shop?filter=best">الأكثر مبيعاً</Link></p><p><Link href="/shop?filter=sale">العروض</Link></p></div>
    <div><h3>الأقسام</h3><p><Link href="/shop?category=egyptian">سجاد مصري</Link></p><p><Link href="/shop?category=belgian-silk">بلجيكي وحرير</Link></p><p><Link href="/shop?category=kitchen-runners">مطبخ وممرات</Link></p><p><Link href="/shop?category=flooring-pvc">PVC وأرضيات</Link></p></div>
    <div><h3>خدمة العملاء</h3><p><Link href="/contact">تواصل معنا</Link></p><p><Link href="/account">طلباتي</Link></p><p><Link href="/privacy">الخصوصية</Link></p></div>
  </div><div className="container footer-bottom"><span>© 2026 Atabeh Royal Carpet</span><span>جميع الحقوق محفوظة</span></div></footer>
  </>}

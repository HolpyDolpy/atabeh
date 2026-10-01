import Link from 'next/link';
export default function Footer(){return <>
  <footer className="footer"><div className="container footer-grid">
    <div className="footer-brand"><img src="/logo.png" alt="Atabeh Royal Carpet"/><p>سجاد أصيل لمنازل أجمل. سجاد، موكيت، قطع يدوية وحلول أرضيات.</p></div>
    <div><h3>التسوق</h3><p><Link href="/shop">كل المنتجات</Link></p><p><Link href="/shop?filter=new">وصل حديثاً</Link></p><p><Link href="/shop?filter=best">الأكثر مبيعاً</Link></p><p><Link href="/shop?filter=sale">العروض</Link></p></div>
    <div><h3>الأقسام</h3><p><Link href="/shop">كل الأنواع</Link></p><p><Link href="/shop?filter=best">الأكثر طلباً</Link></p><p><Link href="/shop?filter=new">جديد المتجر</Link></p><p><Link href="/contact">اطلب مساعدة</Link></p></div>
    <div><h3>خدمة العملاء</h3><p><Link href="/contact">تواصل معنا</Link></p><p><Link href="/account">طلباتي</Link></p><p><Link href="/privacy">الخصوصية</Link></p></div>
  </div><div className="container footer-bottom"><span>© 2026 Atabeh Royal Carpet</span><span>جميع الحقوق محفوظة</span></div><div className="container footer-credit">Everest Solutions</div></footer>
  </>}

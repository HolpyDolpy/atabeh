import Link from 'next/link';
export default function ProductCard({product}){
  return <Link href={`/product/${product.slug}`} className="product-card product-card-v5">
    <div className="product-image-wrap product-image-wrap-v5">
      {product.isNew&&<span className="badge">جديد</span>}
      <img src={product.image} alt={product.name} loading="lazy" decoding="async"/>
      <span className="quick-view-v5">عرض التفاصيل</span>
    </div>
    <div className="product-body product-body-v5"><div className="small category-label-v5">{product.category?.name}</div><h3>{product.name}</h3><div className="price"><span>{Number(product.basePrice).toFixed(2)} ₪/م²</span></div><div className="small">السعر النهائي يحسب حسب المقاس المختار.</div><div className="card-cta card-cta-v5">اختر اللون والنقشة والمقاس <span>←</span></div></div>
  </Link>;
}

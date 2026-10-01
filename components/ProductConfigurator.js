'use client';

import { useMemo, useState } from 'react';
import { Icon } from './Icons';
import { calculateCarpetPrice } from '../lib/pricing';

export default function ProductConfigurator({ product }) {
  const activeVariants = product.variants || [];
  const initial = activeVariants[0] || null;
  const [selectedColor, setSelectedColor] = useState(initial?.color || '');
  const [selectedPattern, setSelectedPattern] = useState(initial?.pattern || '');
  const [selectedSize, setSelectedSize] = useState(initial?.size || '');
  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState('');
  const [activeImage, setActiveImage] = useState(initial?.image || product.image);

  const colors = useMemo(() => {
    const map = new Map();
    for (const v of activeVariants) {
      const key = v.color || 'افتراضي';
      if (!map.has(key)) map.set(key, { name:key, hex:v.colorHex || '#c9b99b', image:v.image || product.image });
    }
    return [...map.values()];
  }, [activeVariants, product.image]);

  const patterns = useMemo(() => {
    const list = activeVariants.filter(v => !selectedColor || (v.color || 'افتراضي') === selectedColor);
    return [...new Set(list.map(v => v.pattern || 'النقشة الأصلية'))];
  }, [activeVariants, selectedColor]);

  const sizes = useMemo(() => {
    const matching = activeVariants.filter(v => (!selectedColor || (v.color || 'افتراضي') === selectedColor) && (!selectedPattern || (v.pattern || 'النقشة الأصلية') === selectedPattern));
    return [...new Set(matching.map(v => v.size))];
  }, [activeVariants, selectedColor, selectedPattern]);

  const selectedVariant = activeVariants.find(v => (v.color || 'افتراضي') === selectedColor && (v.pattern || 'النقشة الأصلية') === selectedPattern && v.size === selectedSize)
    || activeVariants.find(v => (v.color || 'افتراضي') === selectedColor && (v.pattern || 'النقشة الأصلية') === selectedPattern)
    || initial;

  const selectedPricing = selectedVariant ? calculateCarpetPrice(selectedVariant.size, selectedVariant.price) : null;

  const gallery = useMemo(() => {
    const items = [selectedVariant?.image, activeImage, ...(product.gallery || []), product.image].filter(Boolean);
    return [...new Set(items)].slice(0,5);
  }, [selectedVariant, activeImage, product.gallery, product.image]);

  function chooseColor(c){
    setSelectedColor(c.name); setActiveImage(c.image || product.image);
    const first = activeVariants.find(v => (v.color || 'افتراضي') === c.name);
    if(first){ setSelectedPattern(first.pattern || 'النقشة الأصلية'); setSelectedSize(first.size); }
    setMsg('');
  }
  function choosePattern(pattern){
    setSelectedPattern(pattern);
    const first = activeVariants.find(v => (v.color || 'افتراضي') === selectedColor && (v.pattern || 'النقشة الأصلية') === pattern);
    if(first){ setSelectedSize(first.size); if(first.image) setActiveImage(first.image); }
    setMsg('');
  }
  function add(){
    if(!selectedVariant || !selectedPricing) return setMsg('اختر مقاساً صحيحاً أولاً.');
    const cart = JSON.parse(localStorage.getItem('atabeh_cart') || '[]');
    const found = cart.find(x => x.variantId === selectedVariant.id);
    if(found) found.quantity = Math.min(10, found.quantity + qty);
    else cart.push({
      productId:product.id,
      variantId:selectedVariant.id,
      quantity:qty,
      productName:product.name,
      size:selectedVariant.size,
      color:selectedVariant.color||'',
      pattern:selectedVariant.pattern||'',
      area:selectedPricing.area,
      pricePerSqM:selectedPricing.rate,
      unitPrice:selectedPricing.total
    });
    localStorage.setItem('atabeh_cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('atabeh-cart-updated'));
    setMsg('تمت الإضافة إلى السلة');
  }

  const shownImage = selectedVariant?.image || activeImage || product.image;
  const fallbackRate = Number(product.basePrice || 0);

  return <div className="product-configurator product-configurator-v5">
    <div className="product-gallery-v5">
      <div className="product-main-image product-main-image-v5"><img src={shownImage} alt={`${product.name} - ${selectedColor} - ${selectedPattern}`} decoding="async"/></div>
      <div className="gallery-thumbs-v5">{gallery.map((img,i)=><button key={`${img}-${i}`} type="button" className={shownImage===img?'active':''} onClick={()=>setActiveImage(img)}><img src={img} alt={`${product.name} ${i+1}`} loading="lazy" decoding="async"/></button>)}</div>
    </div>

    <div className="product-config-panel product-config-panel-v5">
      <div className="product-breadcrumb-v5"><span>{product.category?.name}</span><span>›</span><span>{product.name}</span></div>
      <h1 className="product-title">{product.name}</h1>
      <div className="price product-price product-price-v5">
        {selectedPricing ? `${selectedPricing.total.toFixed(2)} ₪` : `${fallbackRate.toFixed(2)} ₪/م²`}
      </div>
      {selectedPricing && <div className="price-breakdown"><b>{selectedPricing.area.toFixed(2)} م²</b><span>×</span><span>{selectedPricing.rate.toFixed(2)} ₪/م²</span><span>=</span><strong>{selectedPricing.total.toFixed(2)} ₪</strong></div>}
      <p className="product-description-v5">{product.description}</p>

      <div className="variant-choice-grid variant-choice-grid-v5">
        {colors.length>0 && <div className="product-option compact-option"><div className="option-heading"><strong>اللون</strong><span>{selectedColor}</span></div><div className="color-swatches">{colors.map(c=><button key={c.name} type="button" className={`color-swatch ${selectedColor===c.name?'selected':''}`} style={{'--swatch':c.hex}} onClick={()=>chooseColor(c)} aria-label={`لون ${c.name}`}><span/></button>)}</div></div>}
        {patterns.length>0 && <div className="product-option compact-option"><div className="option-heading"><strong>النقشة</strong><span>{selectedPattern}</span></div><div className="pattern-swatches">{patterns.map((pattern,i)=><button key={pattern} type="button" className={`pattern-swatch p${i%4} ${selectedPattern===pattern?'selected':''}`} onClick={()=>choosePattern(pattern)}><span className="pattern-icon"/>{pattern}</button>)}</div></div>}
      </div>

      <div className="field size-select-v5"><label>المقاس</label><select value={selectedSize} onChange={e=>{setSelectedSize(e.target.value);setMsg('')}} disabled={!sizes.length}>{sizes.length? sizes.map(size=><option key={size} value={size}>{size} متر</option>):<option>لا توجد مقاسات</option>}</select></div>

      {selectedVariant?<div className="availability-row availability-row-v5"><span className="availability-dot"/><div><b>متوفر</b><small>المخزون: {selectedVariant.stock}</small></div></div>:<div className="inline-warning">لا توجد مقاسات متاحة لهذا المنتج بعد. أضف المقاسات من لوحة الإدارة.</div>}

      <div className="buy-row-v5"><div className="qty-stepper-v5"><button type="button" onClick={()=>setQty(Math.max(1,qty-1))}>−</button><span>{qty}</span><button type="button" onClick={()=>setQty(Math.min(10,qty+1))}>+</button></div><button className="btn btn-primary product-add-btn" onClick={add} disabled={!selectedVariant||!selectedPricing}><Icon name="cart" size={19}/> {selectedVariant?'أضف إلى السلة':'أضف مقاساً أولاً'}</button></div>
      {msg&&<p className="notice inline-notice">{msg}</p>}

      <div className="product-assurance-v5"><div><Icon name="shield" size={18}/><span><b>تسعير بالمتر المربع</b><small>السعر النهائي = العرض × الطول × سعر المتر.</small></span></div><div><Icon name="rotate" size={18}/><span><b>اختيار واضح</b><small>المقاس واللون والنقشة محفوظة مع الطلب.</small></span></div><div><Icon name="truck" size={18}/><span><b>تواصل سريع</b><small>تابع الطلب مباشرة عبر واتساب.</small></span></div></div>
    </div>
  </div>;
}

'use client';
import { useState } from 'react';
export default function AddToCart({product}){
  const [variant,setVariant]=useState(product.variants?.[0]?.id||'');
  const [qty,setQty]=useState(1); const [msg,setMsg]=useState('');
  function add(){
    if(!variant){setMsg('اختر المقاس');return}
    const cart=JSON.parse(localStorage.getItem('atabeh_cart')||'[]');
    const found=cart.find(x=>x.variantId===variant);
    if(found) found.quantity=Math.min(10,found.quantity+qty); else cart.push({productId:product.id,variantId:variant,quantity:qty});
    localStorage.setItem('atabeh_cart',JSON.stringify(cart)); setMsg('تمت الإضافة إلى السلة');
  }
  return <div><div className="field"><label>المقاس</label><select value={variant} onChange={e=>setVariant(e.target.value)}>{product.variants.map(v=><option key={v.id} value={v.id}>{v.size}{v.color?` — ${v.color}`:''} — {Number(v.price).toFixed(2)} ₪</option>)}</select></div><div className="field"><label>الكمية</label><input type="number" min="1" max="10" value={qty} onChange={e=>setQty(Math.max(1,Math.min(10,Number(e.target.value)||1)))}/></div><button className="btn btn-primary" onClick={add}>أضف إلى السلة</button>{msg&&<p className="small">{msg}</p>}</div>
}

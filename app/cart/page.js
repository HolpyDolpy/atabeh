'use client';
import { useEffect,useState } from 'react';
import Link from 'next/link';

export default function Cart(){
  const [items,setItems]=useState([]);
  const [ready,setReady]=useState(false);
  useEffect(()=>{ try{setItems(JSON.parse(localStorage.getItem('atabeh_cart')||'[]'))}catch{setItems([])} finally{setReady(true)} },[]);
  function clear(){localStorage.removeItem('atabeh_cart');setItems([]);window.dispatchEvent(new Event('atabeh-cart-updated'))}
  if(!ready) return <main className="container"><div className="checkout-card"><div className="skeleton skeleton-title"/><div className="skeleton form-skeleton-line"/><div className="skeleton form-skeleton-line"/><div className="skeleton form-skeleton-line"/></div></main>;
  return <main className="container"><div className="checkout-card cart-card"><h1>سلة التسوق</h1>{items.length===0?<><p>السلة فارغة.</p><Link className="btn btn-primary" href="/shop">ابدأ التسوق</Link></>:<>
    <p>لديك {items.reduce((s,x)=>s+x.quantity,0)} قطعة في السلة.</p>
    <div className="cart-lines">{items.map((x,i)=><div className="cart-line" key={`${x.variantId}-${i}`}><div><b>{x.productName||'سجادة'}</b><div className="small">{x.color&&<>لون: {x.color}</>} {x.pattern&&<>• نقشة: {x.pattern}</>} {x.size&&<>• مقاس: {x.size} م</>} {x.area&&<>• المساحة: {Number(x.area).toFixed(2)} م²</>} {x.pricePerSqM&&<>• {Number(x.pricePerSqM).toFixed(2)} ₪/م²</>}</div></div><div className="cart-line-meta"><span>× {x.quantity}</span>{x.unitPrice!=null&&<b>{(Number(x.unitPrice)*x.quantity).toFixed(2)} ₪</b>}</div></div>)}</div>
    <div className="notice">سيتم التحقق من السعر والمخزون على الخادم في خطوة إتمام الطلب، وليس الاعتماد على بيانات المتصفح.</div>
    <div style={{display:'flex',gap:10,marginTop:18,flexWrap:'wrap'}}><Link className="btn btn-primary" href="/checkout">إتمام الطلب</Link><button className="btn btn-outline" onClick={clear}>تفريغ السلة</button></div>
  </>}</div></main>;
}

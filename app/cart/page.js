'use client';
import { useEffect,useState } from 'react';
import Link from 'next/link';

export default function Cart(){
  const [items,setItems]=useState([]);
  useEffect(()=>{ try{setItems(JSON.parse(localStorage.getItem('atabeh_cart')||'[]'))}catch{setItems([])} },[]);
  function clear(){localStorage.removeItem('atabeh_cart');setItems([]);window.dispatchEvent(new Event('atabeh-cart-updated'))}
  return <main className="container"><div className="checkout-card cart-card"><h1>سلة التسوق</h1>{items.length===0?<><p>السلة فارغة.</p><Link className="btn btn-primary" href="/shop">ابدأ التسوق</Link></>:<>
    <p>لديك {items.reduce((s,x)=>s+x.quantity,0)} قطعة في السلة.</p>
    <div className="cart-lines">{items.map((x,i)=><div className="cart-line" key={`${x.variantId}-${i}`}><div><b>{x.productName||'سجادة'}</b><div className="small">{x.color&&<>لون: {x.color}</>} {x.pattern&&<>• نقشة: {x.pattern}</>} {x.size&&<>• مقاس: {x.size}</>}</div></div><div className="cart-line-meta"><span>× {x.quantity}</span>{x.unitPrice!=null&&<b>{(Number(x.unitPrice)*x.quantity).toFixed(2)} ₪</b>}</div></div>)}</div>
    <div className="notice">سيتم التحقق من السعر والمخزون على الخادم في خطوة إتمام الطلب، وليس الاعتماد على بيانات المتصفح.</div>
    <div style={{display:'flex',gap:10,marginTop:18,flexWrap:'wrap'}}><Link className="btn btn-primary" href="/checkout">إتمام الطلب</Link><button className="btn btn-outline" onClick={clear}>تفريغ السلة</button></div>
  </>}</div></main>;
}

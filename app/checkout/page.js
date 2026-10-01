'use client';
import { useState } from 'react';
import { getWhatsAppHref } from '../../components/WhatsAppOrderButton';

function orderWhatsAppText(order, customer) {
  const lines = (order.items || []).map((x, i) => {
    const details = [x.color ? `لون: ${x.color}` : '',x.pattern ? `نقشة: ${x.pattern}` : '',x.size ? `مقاس: ${x.size}` : ''].filter(Boolean).join(' | ');
    return `${i + 1}. ${x.name}${details ? ` — ${details}` : ''} × ${x.quantity} — ${Number(x.lineTotal).toFixed(2)} ₪`;
  });
  return ['طلب جديد — عتابه للسجاد',`رقم الطلب: ${order.orderNumber}`,'',`الاسم: ${customer.customerName}`,`الهاتف: ${customer.phone}`,`المدينة: ${customer.city}`,`العنوان: ${customer.addressLine1}${customer.addressLine2 ? `، ${customer.addressLine2}` : ''}`,customer.notes ? `ملاحظات: ${customer.notes}` : '','', 'تفاصيل الطلب:',...lines,'',`المجموع الفرعي: ${Number(order.subtotal).toFixed(2)} ₪`,`التوصيل: ${Number(order.shipping).toFixed(2)} ₪`,`الإجمالي: ${Number(order.total).toFixed(2)} ₪`].filter(Boolean).join('\n');
}

export default function Checkout(){
  const [busy,setBusy]=useState(false);
  const [status,setStatus]=useState('');
  const [errors,setErrors]=useState({});
  const [completed,setCompleted]=useState(null);

  async function submit(e){
    e.preventDefault();
    if(busy) return;
    setStatus(''); setErrors({}); setCompleted(null);
    const form=new FormData(e.currentTarget);
    const customer={customerName:String(form.get('customerName')||'').trim(),email:String(form.get('email')||'').trim(),phone:String(form.get('phone')||'').trim(),addressLine1:String(form.get('addressLine1')||'').trim(),addressLine2:String(form.get('addressLine2')||'').trim(),city:String(form.get('city')||'').trim(),notes:String(form.get('notes')||'').trim()};
    const next={};
    if(!customer.customerName) next.customerName='يرجى إدخال الاسم.';
    if(!customer.email) next.email='يرجى إدخال البريد الإلكتروني.'; else if(!/^\S+@\S+\.\S+$/.test(customer.email)) next.email='أدخل بريداً إلكترونياً صحيحاً.';
    if(!customer.phone) next.phone='يرجى إدخال رقم الهاتف.';
    if(!customer.addressLine1) next.addressLine1='يرجى إدخال العنوان.';
    if(!customer.city) next.city='يرجى إدخال المدينة.';
    let items=[]; try{items=JSON.parse(localStorage.getItem('atabeh_cart')||'[]')}catch{}
    if(!items.length) next.cart='سلة التسوق فارغة. أضف منتجاً قبل إتمام الطلب.';
    setErrors(next); if(Object.keys(next).length) return;
    setBusy(true); setStatus('جاري إنشاء الطلب والتحقق من السعر والمخزون...');
    try{
      const r=await fetch('/api/checkout',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({...customer,items})});
      const data=await r.json().catch(()=>({}));
      if(r.ok){localStorage.removeItem('atabeh_cart');window.dispatchEvent(new Event('atabeh-cart-updated'));setCompleted({...data,whatsappHref:getWhatsAppHref(orderWhatsAppText(data,customer))});setStatus('');}
      else setStatus(data.error||'تعذر إنشاء الطلب. راجع البيانات وحاول مرة أخرى.');
    }catch{setStatus('تعذر الاتصال بالخادم. تحقق من الإنترنت وحاول مرة أخرى.');}
    finally{setBusy(false)}
  }

  if (completed) return <main className="container"><div className="checkout-card checkout-success"><div className="success-check">✓</div><h1>طلبك جاهز للإرسال</h1><p>تم إنشاء الطلب رقم <b>{completed.orderNumber}</b> وحفظه في النظام.</p><div className="order-total-box"><span>الإجمالي</span><strong>{Number(completed.total).toFixed(2)} ₪</strong></div><a className="btn whatsapp-order-send" href={completed.whatsappHref} target="_blank" rel="noopener noreferrer">إرسال الطلب إلى واتساب</a><p className="small">سيفتح واتساب على محادثة العمل مع تفاصيل الطلب جاهزة. راجع الرسالة واضغط إرسال.</p></div></main>;

  const FieldError=({name})=>errors[name]?<span className="field-error" role="alert">{errors[name]}</span>:null;
  return <main className="container"><div className="checkout-card"><h1>إتمام الطلب</h1>{errors.cart&&<div className="form-error">{errors.cart}</div>}<form onSubmit={submit} data-no-global-loading="true" noValidate><div className="field"><label>الاسم</label><input name="customerName" disabled={busy}/><FieldError name="customerName"/></div><div className="field"><label>البريد</label><input type="email" name="email" disabled={busy}/><FieldError name="email"/></div><div className="field"><label>الهاتف</label><input name="phone" disabled={busy}/><FieldError name="phone"/></div><div className="field"><label>العنوان</label><input name="addressLine1" disabled={busy}/><FieldError name="addressLine1"/></div><div className="field"><label>تفاصيل إضافية</label><input name="addressLine2" disabled={busy}/></div><div className="field"><label>المدينة</label><input name="city" disabled={busy}/><FieldError name="city"/></div><div className="field"><label>ملاحظات</label><textarea name="notes" rows="4" disabled={busy}/></div><button className="btn btn-primary" disabled={busy} aria-busy={busy}>{busy&&<span className="button-spinner"/>}{busy?'جاري تأكيد الطلب...':'تأكيد الطلب'}</button></form>{status&&<div className={busy?'notice':'form-error'} style={{marginTop:15}}>{status}</div>}<p className="small">بعد إنشاء الطلب سيظهر زر واتساب برسالة جاهزة تتضمن رقم الطلب، الأصناف، اللون، النقشة، المقاس، العنوان والإجمالي.</p></div></main>;
}

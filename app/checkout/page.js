'use client';
import { useState } from 'react';
import { getWhatsAppHref } from '../../components/WhatsAppOrderButton';

function orderWhatsAppText(order, customer) {
  const lines = (order.items || []).map((x, i) => {
    const details = [
      x.color ? `لون: ${x.color}` : '',
      x.pattern ? `نقشة: ${x.pattern}` : '',
      x.size ? `مقاس: ${x.size}` : ''
    ].filter(Boolean).join(' | ');
    return `${i + 1}. ${x.name}${details ? ` — ${details}` : ''} × ${x.quantity} — ${Number(x.lineTotal).toFixed(2)} ₪`;
  });

  return [
    'طلب جديد — عتابه للسجاد',
    `رقم الطلب: ${order.orderNumber}`,
    '',
    `الاسم: ${customer.customerName}`,
    `الهاتف: ${customer.phone}`,
    `المدينة: ${customer.city}`,
    `العنوان: ${customer.addressLine1}${customer.addressLine2 ? `، ${customer.addressLine2}` : ''}`,
    customer.notes ? `ملاحظات: ${customer.notes}` : '',
    '',
    'تفاصيل الطلب:',
    ...lines,
    '',
    `المجموع الفرعي: ${Number(order.subtotal).toFixed(2)} ₪`,
    `التوصيل: ${Number(order.shipping).toFixed(2)} ₪`,
    `الإجمالي: ${Number(order.total).toFixed(2)} ₪`
  ].filter(Boolean).join('\n');
}

export default function Checkout(){
  const [status,setStatus]=useState('');
  const [completed,setCompleted]=useState(null);

  async function submit(e){
    e.preventDefault();
    setStatus('جاري إنشاء الطلب...');
    setCompleted(null);
    const form=new FormData(e.currentTarget);
    let items=[];
    try{items=JSON.parse(localStorage.getItem('atabeh_cart')||'[]')}catch{}
    const customer={
      customerName:form.get('customerName'),
      email:form.get('email'),
      phone:form.get('phone'),
      addressLine1:form.get('addressLine1'),
      addressLine2:form.get('addressLine2'),
      city:form.get('city'),
      notes:form.get('notes')
    };
    const body={...customer,items};
    const r=await fetch('/api/checkout',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
    const data=await r.json();
    if(r.ok){
      localStorage.removeItem('atabeh_cart');
      window.dispatchEvent(new Event('atabeh-cart-updated'));
      const text=orderWhatsAppText(data, customer);
      setCompleted({...data, whatsappHref:getWhatsAppHref(text)});
      setStatus('');
    }else setStatus(data.error||'تعذر إنشاء الطلب');
  }

  if (completed) return (
    <main className="container">
      <div className="checkout-card checkout-success">
        <div className="success-check">✓</div>
        <h1>طلبك جاهز للإرسال</h1>
        <p>تم إنشاء الطلب رقم <b>{completed.orderNumber}</b> وحفظه في النظام.</p>
        <div className="order-total-box"><span>الإجمالي</span><strong>{Number(completed.total).toFixed(2)} ₪</strong></div>
        <a className="btn whatsapp-order-send" href={completed.whatsappHref} target="_blank" rel="noopener noreferrer">
          <svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M16.05 3C8.89 3 3.07 8.7 3.07 15.72c0 2.25.6 4.44 1.74 6.36L3 29l7.09-1.82a13.2 13.2 0 0 0 5.95 1.44h.01c7.16 0 12.98-5.7 12.98-12.72C29.03 8.87 23.21 3 16.05 3Zm0 23.47h-.01a11 11 0 0 1-5.59-1.5l-.4-.23-4.21 1.08 1.12-4.01-.26-.41a10.47 10.47 0 0 1-1.68-5.68c0-5.83 4.95-10.57 11.03-10.57 6.08 0 11.03 4.74 11.03 10.57 0 5.83-4.95 10.75-11.03 10.75Z"/></svg>
          إرسال الطلب إلى واتساب
        </a>
        <p className="small">سيفتح واتساب على محادثة العمل مع تفاصيل الطلب جاهزة. راجع الرسالة واضغط إرسال.</p>
      </div>
    </main>
  );

  return <main className="container"><div className="checkout-card"><h1>إتمام الطلب</h1><form onSubmit={submit}><div className="field"><label>الاسم</label><input name="customerName" required/></div><div className="field"><label>البريد</label><input type="email" name="email" required/></div><div className="field"><label>الهاتف</label><input name="phone" required/></div><div className="field"><label>العنوان</label><input name="addressLine1" required/></div><div className="field"><label>تفاصيل إضافية</label><input name="addressLine2"/></div><div className="field"><label>المدينة</label><input name="city" required/></div><div className="field"><label>ملاحظات</label><textarea name="notes" rows="4"/></div><button className="btn btn-primary">تأكيد الطلب</button></form>{status&&<p className="notice" style={{marginTop:15}}>{status}</p>}<p className="small">بعد إنشاء الطلب سيظهر زر واتساب برسالة جاهزة تتضمن رقم الطلب، الأصناف، اللون، النقشة، المقاس، العنوان والإجمالي.</p></div></main>
}

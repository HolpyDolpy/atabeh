'use client';

import { useEffect, useMemo, useState } from 'react';

const FALLBACK_NUMBER = '972599085646';

function cleanNumber(value) {
  return (value || '').replace(/[^\d]/g, '');
}

function readCart() {
  try { return JSON.parse(localStorage.getItem('atabeh_cart') || '[]'); }
  catch { return []; }
}

export function buildCartWhatsAppText(cart) {
  if (!cart.length) {
    return [
      'مرحباً عتبة للسجاد 👋',
      'أرغب بالاستفسار عن السجاد المتوفر لديكم.'
    ].join('\n');
  }

  const lines = cart.map((x, i) => {
    const details = [
      x.color ? `لون: ${x.color}` : '',
      x.pattern ? `نقشة: ${x.pattern}` : '',
      x.size ? `مقاس: ${x.size}` : ''
    ].filter(Boolean).join(' | ');
    const price = x.unitPrice != null ? ` | ${(Number(x.unitPrice) * (x.quantity || 1)).toFixed(2)} ₪` : '';
    return `${i + 1}. ${x.productName || 'سجادة'}${details ? ` — ${details}` : ''} × ${x.quantity || 1}${price}`;
  });

  return [
    'مرحباً عتبة للسجاد 👋',
    'أرغب بإكمال هذا الطلب:',
    '',
    ...lines,
    '',
    'يرجى تأكيد التوفر والسعر النهائي والتوصيل.'
  ].join('\n');
}

export function getWhatsAppHref(text) {
  const number = cleanNumber(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER) || FALLBACK_NUMBER;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

export default function WhatsAppOrderButton() {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const read = () => setCart(readCart());
    read();
    window.addEventListener('storage', read);
    window.addEventListener('atabeh-cart-updated', read);
    return () => {
      window.removeEventListener('storage', read);
      window.removeEventListener('atabeh-cart-updated', read);
    };
  }, []);

  const itemCount = cart.reduce((n, x) => n + (Number(x.quantity) || 0), 0);
  const href = useMemo(() => getWhatsAppHref(buildCartWhatsAppText(cart)), [cart]);

  return (
    <a
      className="whatsapp-fab"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="إرسال الطلب إلى واتساب عتبة"
      title="واتساب عتبة"
    >
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path fill="currentColor" d="M16.05 3C8.89 3 3.07 8.7 3.07 15.72c0 2.25.6 4.44 1.74 6.36L3 29l7.09-1.82a13.2 13.2 0 0 0 5.95 1.44h.01c7.16 0 12.98-5.7 12.98-12.72C29.03 8.87 23.21 3 16.05 3Zm0 23.47h-.01a11 11 0 0 1-5.59-1.5l-.4-.23-4.21 1.08 1.12-4.01-.26-.41a10.47 10.47 0 0 1-1.68-5.68c0-5.83 4.95-10.57 11.03-10.57 6.08 0 11.03 4.74 11.03 10.57 0 5.83-4.95 10.75-11.03 10.75Zm6.05-7.91c-.33-.16-1.96-.95-2.27-1.06-.3-.11-.52-.16-.74.16-.22.32-.85 1.06-1.04 1.28-.19.21-.38.24-.71.08-.33-.16-1.39-.5-2.65-1.6-.98-.85-1.64-1.91-1.84-2.23-.19-.32-.02-.49.14-.65.15-.14.33-.37.49-.56.16-.19.22-.32.33-.53.11-.21.05-.4-.03-.56-.08-.16-.74-1.75-1.02-2.4-.27-.65-.54-.56-.74-.57h-.63c-.22 0-.57.08-.87.4-.3.32-1.15 1.11-1.15 2.7 0 1.59 1.18 3.13 1.34 3.34.16.21 2.32 3.48 5.62 4.88.79.33 1.4.53 1.88.68.79.25 1.51.21 2.08.13.63-.09 1.96-.79 2.24-1.55.27-.77.27-1.43.19-1.56-.08-.13-.3-.21-.63-.37Z"/>
      </svg>
      {itemCount > 0 && <span className="whatsapp-count">{itemCount > 99 ? '99+' : itemCount}</span>}
      <span className="whatsapp-label">واتساب</span>
    </a>
  );
}

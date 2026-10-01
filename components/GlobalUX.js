'use client';

import { useEffect, useRef, useState } from 'react';

export default function GlobalUX(){
  const [busy,setBusy]=useState(false);
  const [label,setLabel]=useState('جاري فتح الصفحة...');
  const clearTimer=useRef(null);
  const minTimer=useRef(null);
  const startedAt=useRef(0);

  useEffect(()=>{
    const MIN_VISIBLE=420;
    function begin(nextLabel='جاري فتح الصفحة...'){
      startedAt.current=Date.now();
      setLabel(nextLabel);
      setBusy(true);
      clearTimeout(clearTimer.current);
      clearTimer.current=setTimeout(()=>setBusy(false),12000);
    }
    function end(){
      const elapsed=Date.now()-startedAt.current;
      clearTimeout(minTimer.current);
      minTimer.current=setTimeout(()=>setBusy(false),Math.max(0,MIN_VISIBLE-elapsed));
    }
    function onClick(e){
      const a=e.target?.closest?.('a[href]');
      if(!a || e.defaultPrevented || e.button!==0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const href=a.getAttribute('href')||'';
      if(!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || a.target==='_blank' || a.hasAttribute('download')) return;
      try{
        const url=new URL(a.href,window.location.href);
        if(url.origin===window.location.origin && url.href!==window.location.href) begin('جاري تجهيز الصفحة...');
      }catch{}
    }
    function onSubmit(e){
      const form=e.target;
      if(!(form instanceof HTMLFormElement) || form.dataset.noGlobalLoading==='true') return;
      begin('جاري تطبيق طلبك...');
    }

    const originalPush=history.pushState.bind(history);
    const originalReplace=history.replaceState.bind(history);
    history.pushState=(...args)=>{ const r=originalPush(...args); queueMicrotask(end); return r; };
    history.replaceState=(...args)=>{ const r=originalReplace(...args); queueMicrotask(end); return r; };
    const onPop=()=>{ begin('جاري الرجوع...'); setTimeout(end,60); };
    const onPageShow=()=>end();

    document.addEventListener('click',onClick,true);
    document.addEventListener('submit',onSubmit,true);
    window.addEventListener('popstate',onPop);
    window.addEventListener('pageshow',onPageShow);
    return ()=>{
      document.removeEventListener('click',onClick,true);
      document.removeEventListener('submit',onSubmit,true);
      window.removeEventListener('popstate',onPop);
      window.removeEventListener('pageshow',onPageShow);
      history.pushState=originalPush;
      history.replaceState=originalReplace;
      clearTimeout(clearTimer.current);
      clearTimeout(minTimer.current);
    };
  },[]);

  return <div className={`global-loading ${busy?'is-active':''}`} aria-live="polite" aria-hidden={!busy}>
    <div className="global-loading-bar"/>
    <div className="global-loading-panel" role="status">
      <div className="loading-brand-row"><img src="/logo.png" alt=""/><div><b>{label}</b><span>لحظات ونجهز لك المحتوى</span></div></div>
      <div className="loading-skeleton-row"><i/><i/><i/></div>
    </div>
  </div>;
}

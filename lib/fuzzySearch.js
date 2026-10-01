function normalize(value='') {
  return String(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[^a-z0-9\u0600-\u06ff]+/g, ' ')
    .trim();
}

function levenshtein(a,b){
  if(a===b) return 0;
  if(!a.length) return b.length;
  if(!b.length) return a.length;
  const prev=Array.from({length:b.length+1},(_,i)=>i);
  const cur=new Array(b.length+1);
  for(let i=1;i<=a.length;i++){
    cur[0]=i;
    for(let j=1;j<=b.length;j++) cur[j]=Math.min(cur[j-1]+1,prev[j]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1));
    for(let j=0;j<=b.length;j++) prev[j]=cur[j];
  }
  return prev[b.length];
}

function fieldScore(query, field){
  const q=normalize(query), f=normalize(field);
  if(!q||!f) return 0;
  if(f===q) return 120;
  if(f.startsWith(q)) return 105;
  if(f.includes(q)) return 95;
  const qTokens=q.split(' ').filter(Boolean), fTokens=f.split(' ').filter(Boolean);
  let tokenScore=0;
  for(const qt of qTokens){
    if(fTokens.some(ft=>ft===qt)) tokenScore+=28;
    else if(fTokens.some(ft=>ft.startsWith(qt)||qt.startsWith(ft))) tokenScore+=22;
    else {
      const best=Math.min(...fTokens.map(ft=>levenshtein(qt,ft)));
      const limit=qt.length<=4?1:qt.length<=8?2:3;
      if(best<=limit) tokenScore+=Math.max(10,20-best*4);
    }
  }
  const dist=levenshtein(q,f);
  const ratio=1-dist/Math.max(q.length,f.length,1);
  return Math.max(tokenScore,ratio>=.72?Math.round(ratio*70):0);
}

export function scoreProduct(product, query){
  const fields=[product.name,product.description,product.category?.name,product.category?.slug];
  for(const v of product.variants||[]) fields.push(v.color,v.pattern,v.size,v.sku);
  return Math.max(0,...fields.filter(Boolean).map((x,i)=>fieldScore(query,x)*(i===0?1.15:1)));
}

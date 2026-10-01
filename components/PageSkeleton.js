function ProductGhost({i}){
  return <div className="skeleton-card" key={i}><div className="skeleton skeleton-image"/><div className="skeleton skeleton-line"/><div className="skeleton skeleton-line short"/><div className="skeleton skeleton-pill"/></div>;
}

export default function PageSkeleton({kind='products', compact=false}){
  if(kind==='admin') return <main className="admin-skeleton"><div className="skeleton skeleton-title"/><div className="skeleton-admin-grid">{[0,1,2,3].map(i=><div className="skeleton stat-skeleton" key={i}/>)}</div><div className="skeleton table-skeleton"/></main>;
  if(kind==='product') return <main className="container skeleton-page"><div className="product-skeleton"><div className="skeleton product-skeleton-image"/><div><div className="skeleton skeleton-title"/><div className="skeleton skeleton-line"/><div className="skeleton skeleton-line short"/><div className="skeleton option-skeleton"/><div className="skeleton option-skeleton"/><div className="skeleton skeleton-button"/></div></div></main>;
  if(kind==='form') return <main className="container skeleton-page"><div className="form-skeleton-card"><div className="skeleton skeleton-title"/>{[0,1,2,3].map(i=><div className="skeleton form-skeleton-line" key={i}/>)}</div></main>;
  if(kind==='filters') return <div className="shop-stream-skeleton"><aside className="filter-skeleton-panel"><div className="skeleton skeleton-line"/>{[0,1,2,3,4].map(i=><div className="skeleton filter-skeleton-line" key={i}/>)}</aside><div className="shop-results-skeleton"><div className="skeleton toolbar-skeleton"/><div className="skeleton-grid">{[0,1,2,3,4,5].map(i=><ProductGhost i={i} key={i}/>)}</div></div></div>;
  const Tag=compact?'div':'main'; return <Tag className={`container skeleton-page ${compact?'skeleton-page-compact':''}`} aria-label="جاري التحميل"><div className="skeleton skeleton-title"/><div className="skeleton-grid">{[0,1,2,3,4,5,6,7].map(i=><ProductGhost i={i} key={i}/>)}</div></Tag>;
}

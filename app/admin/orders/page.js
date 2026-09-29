import Link from 'next/link';
import { prisma } from '../../../lib/db';
export default async function OrdersAdmin(){
  const orders=await prisma.order.findMany({include:{items:true},orderBy:{createdAt:'desc'},take:500});
  return <><div className="admin-topbar"><div><h1>الطلبات</h1><p className="small">عرض وتعديل حالة كل طلب أو فتح تفاصيله.</p></div></div><div className="table-wrap"><table className="table"><thead><tr><th>رقم الطلب</th><th>العميل</th><th>الهاتف</th><th>الإجمالي</th><th>الحالة</th><th>العناصر</th><th>التاريخ</th><th>الإجراءات</th></tr></thead><tbody>{orders.map(o=><tr key={o.id}><td>{o.orderNumber}</td><td>{o.customerName}</td><td>{o.phone}</td><td>{Number(o.total).toFixed(2)} ₪</td><td><span className="admin-badge">{o.status}</span></td><td>{o.items.length}</td><td>{o.createdAt.toLocaleString('ar')}</td><td><Link className="btn btn-soft" href={`/admin/orders/${o.id}`}>فتح</Link></td></tr>)}</tbody></table></div></>;
}

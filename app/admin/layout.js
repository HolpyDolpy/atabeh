import { redirect } from 'next/navigation';
import { requireAdmin } from '../../lib/auth';
import AdminNav from '../../components/AdminNav';
export default async function AdminLayout({children}){const admin=await requireAdmin();if(!admin)redirect('/login');return <div className="admin-shell"><AdminNav/><main className="admin-main">{children}</main></div>}

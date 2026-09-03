import { requireAgentOrAdmin } from '@/lib/session';
import { getDashboardStats } from '@/lib/admin/dashboard';
import { DashboardView } from './dashboard-view';

export default async function AdminDashboardPage() {
  const user = await requireAgentOrAdmin();
  const stats = await getDashboardStats(user);

  return <DashboardView user={{ email: user.email ?? '', role: user.role }} stats={stats} />;
}

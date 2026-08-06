import type { Metadata } from 'next';
import { getCurrentUser } from '@/lib/session';
import { AdminShell } from '@/components/admin/admin-shell';

export const metadata: Metadata = { robots: { index: false, follow: false } };

// No auth check here — /admin/login renders through this same layout and
// must stay reachable while logged out. Real gating is proxy.ts (routes)
// and requireAgentOrAdmin() (data, called per-page). An absent user just
// means "render children bare" (the login page supplies its own centered
// card layout).
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) return <>{children}</>;
  return <AdminShell user={{ email: user.email ?? '', role: user.role }}>{children}</AdminShell>;
}

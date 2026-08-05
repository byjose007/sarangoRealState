import type { Metadata } from 'next';

export const metadata: Metadata = { robots: { index: false, follow: false } };

// Real sidebar/topbar shell arrives with the rest of the admin UI. Auth
// gating lives in proxy.ts (route-level) and requireAgentOrAdmin() (data
// level, called per-page) — not here, since /admin/login also renders
// through this layout and must stay reachable while logged out.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-background">{children}</div>;
}

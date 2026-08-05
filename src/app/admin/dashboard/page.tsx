import { requireAgentOrAdmin } from '@/lib/session';
import { logoutAction } from '../actions';
import { Button } from '@/components/ui/button';

// Placeholder — the real dashboard (KPI tiles, activity feed) is built in
// the admin-UI phase. This exists to verify the auth loop end-to-end.
export default async function AdminDashboardPage() {
  const user = await requireAgentOrAdmin();

  return (
    <div className="container max-w-2xl py-16">
      <h1 className="text-headline text-2xl">Dashboard</h1>
      <dl className="mt-6 space-y-2 text-sm">
        <div className="flex gap-2">
          <dt className="font-mono text-muted-foreground">Email</dt>
          <dd>{user.email}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="font-mono text-muted-foreground">Rol</dt>
          <dd>{user.role}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="font-mono text-muted-foreground">Agent ID</dt>
          <dd>{user.agentId ?? '—'}</dd>
        </div>
      </dl>
      <form action={logoutAction} className="mt-8">
        <Button type="submit" variant="outline">
          Cerrar sesión
        </Button>
      </form>
    </div>
  );
}

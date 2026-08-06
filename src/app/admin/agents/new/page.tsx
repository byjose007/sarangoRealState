import { requireAdmin } from '@/lib/session';
import { AgentForm } from '../agent-form';

export default async function NewAgentPage() {
  await requireAdmin();

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-headline text-2xl">New agent</h1>
      <AgentForm />
    </div>
  );
}

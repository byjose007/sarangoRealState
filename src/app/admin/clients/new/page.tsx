import { requireAgentOrAdmin } from '@/lib/session';
import { ClientForm } from '../client-form';

export default async function NewClientPage() {
  await requireAgentOrAdmin();

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-headline text-2xl">New client</h1>
      <ClientForm />
    </div>
  );
}

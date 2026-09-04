import { requireAgentOrAdmin } from '@/lib/session';
import { NewClientView } from './new-client-view';

export default async function NewClientPage() {
  await requireAgentOrAdmin();

  return <NewClientView />;
}

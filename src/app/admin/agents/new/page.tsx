import { requireAdmin } from '@/lib/session';
import { NewAgentView } from './new-agent-view';

export default async function NewAgentPage() {
  await requireAdmin();

  return <NewAgentView />;
}

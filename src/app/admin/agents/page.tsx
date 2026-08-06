import Link from 'next/link';
import { requireAdmin } from '@/lib/session';
import * as agentsCore from '@/lib/admin/agents';
import { Button } from '@/components/ui/button';
import { DeleteAgentButton } from './delete-agent-button';

export default async function AdminAgentsPage() {
  const actor = await requireAdmin();
  const agents = await agentsCore.listAgents(actor);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-headline text-2xl">Agents</h1>
        <Link href="/admin/agents/new">
          <Button>New agent</Button>
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40 text-left font-mono text-[0.68rem] uppercase tracking-[0.1em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-normal">Name</th>
              <th className="px-4 py-3 font-normal">Role</th>
              <th className="px-4 py-3 font-normal">City</th>
              <th className="px-4 py-3 font-normal">Deals</th>
              <th className="px-4 py-3 font-normal">Rating</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {agents.map((agent) => (
              <tr key={agent.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <Link href={`/admin/agents/${agent.id}`} className="font-medium hover:underline">
                    {agent.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">{agent.email}</p>
                </td>
                <td className="px-4 py-3">{agent.role}</td>
                <td className="px-4 py-3">{agent.citySlug}</td>
                <td className="px-4 py-3 tabular-nums">{agent.dealsClosed}</td>
                <td className="px-4 py-3 tabular-nums">{agent.rating.toFixed(1)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/agents/${agent.id}`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                    <DeleteAgentButton id={agent.id} name={agent.name} />
                  </div>
                </td>
              </tr>
            ))}
            {agents.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  No agents yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

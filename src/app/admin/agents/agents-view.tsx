'use client';

import Link from 'next/link';
import { useTranslation } from '@/i18n/context';
import { Button } from '@/components/ui/button';
import { DeleteAgentButton } from './delete-agent-button';

interface AgentItem {
  id: string;
  name: string;
  email: string;
  role: string;
  citySlug: string;
  dealsClosed: number;
  rating: number;
}

export function AgentsView({ agents }: { agents: AgentItem[] }) {
  const { t, isEs } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl text-headline tracking-tight">
          {t.admin?.agents ?? (isEs ? 'Agentes' : 'Agents')}
        </h1>
        <Link href="/admin/agents/new">
          <Button>{t.admin?.newAgent ?? (isEs ? 'Nuevo agente' : 'New agent')}</Button>
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40 text-left font-mono text-[0.68rem] uppercase tracking-[0.1em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-normal">
                {t.admin?.name ?? (isEs ? 'Nombre' : 'Name')}
              </th>
              <th className="px-4 py-3 font-normal">{t.admin?.role ?? (isEs ? 'Rol' : 'Role')}</th>
              <th className="px-4 py-3 font-normal">
                {t.admin?.city ?? (isEs ? 'Ciudad' : 'City')}
              </th>
              <th className="px-4 py-3 font-normal">
                {t.admin?.deals ?? (isEs ? 'Operaciones' : 'Deals')}
              </th>
              <th className="px-4 py-3 font-normal">
                {t.admin?.rating ?? (isEs ? 'Calificación' : 'Rating')}
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {agents.map((agent) => (
              <tr key={agent.id} className="border-b border-border last:border-0 hover:bg-muted/20">
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
                        {t.admin?.edit ?? (isEs ? 'Editar' : 'Edit')}
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
                  {t.admin?.noAgentsYet ??
                    (isEs ? 'Aún no hay agentes registrados.' : 'No agents yet.')}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

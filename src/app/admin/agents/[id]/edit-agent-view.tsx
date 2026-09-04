'use client';

import { useTranslation } from '@/i18n/context';
import { AgentForm, type AgentFormValues } from '../agent-form';

interface EditAgentViewProps {
  agentId: string;
  initialValues: Partial<AgentFormValues>;
}

export function EditAgentView({ agentId, initialValues }: EditAgentViewProps) {
  const { isEs } = useTranslation();

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl text-headline">{isEs ? 'Editar agente' : 'Edit agent'}</h1>
      <AgentForm agentId={agentId} initialValues={initialValues} />
    </div>
  );
}

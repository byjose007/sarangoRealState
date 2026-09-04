'use client';

import { useTranslation } from '@/i18n/context';
import { AgentForm } from '../agent-form';

export function NewAgentView() {
  const { isEs } = useTranslation();

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl text-headline">{isEs ? 'Nuevo agente' : 'New agent'}</h1>
      <AgentForm />
    </div>
  );
}

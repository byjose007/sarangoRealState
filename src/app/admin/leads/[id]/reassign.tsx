'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Select } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { assignLeadAction } from '@/actions/lead-pipeline';
import { useTranslation } from '@/i18n/context';

export function ReassignLead({
  leadId,
  currentAgentId,
  agentOptions,
}: {
  leadId: string;
  currentAgentId: string | null;
  agentOptions: { id: string; name: string }[];
}) {
  const router = useRouter();
  const { isEs } = useTranslation();
  const [agentId, setAgentId] = useState(currentAgentId ?? '');
  const [pending, startTransition] = useTransition();

  function submit() {
    if (!agentId) return;
    startTransition(async () => {
      const result = await assignLeadAction(leadId, agentId);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      router.refresh();
    });
  }

  return (
    <div className="flex gap-2">
      <Select value={agentId} onChange={(e) => setAgentId(e.target.value)} className="flex-1">
        <option value="" disabled>
          {isEs ? 'Seleccionar un agente' : 'Select an agent'}
        </option>
        {agentOptions.map((agent) => (
          <option key={agent.id} value={agent.id}>
            {agent.name}
          </option>
        ))}
      </Select>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={submit}
        disabled={pending || !agentId || agentId === currentAgentId}
      >
        {pending ? (isEs ? 'Guardando…' : 'Saving…') : isEs ? 'Reasignar' : 'Reassign'}
      </Button>
    </div>
  );
}

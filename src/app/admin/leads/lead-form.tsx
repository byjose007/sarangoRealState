'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createLeadAction } from '@/actions/lead-pipeline';
import { Select, Textarea } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/admin/field';
import { useTranslation } from '@/i18n/context';

interface Option {
  id: string;
  label: string;
}

export function LeadForm({
  clientOptions,
  propertyOptions,
  agentOptions,
}: {
  clientOptions: Option[];
  propertyOptions: Option[];
  agentOptions?: Option[];
}) {
  const router = useRouter();
  const { isEs } = useTranslation();
  const [clientId, setClientId] = useState('');
  const [propertyId, setPropertyId] = useState('');
  const [agentId, setAgentId] = useState('');
  const [message, setMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});

    startTransition(async () => {
      const result = await createLeadAction({
        clientId,
        propertyId: propertyId || undefined,
        assignedAgentId: agentId || undefined,
        source: 'MANUAL',
        message: message || undefined,
      });

      if (!result.ok) {
        setFormError(result.message);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }

      toast.success(result.message);
      router.push(`/admin/leads/${result.data!.id}`);
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {formError ? <p className="text-sm text-destructive">{formError}</p> : null}

      <Field label={isEs ? 'Cliente' : 'Client'} error={fieldErrors.clientId}>
        <Select value={clientId} onChange={(e) => setClientId(e.target.value)} required>
          <option value="" disabled>
            {isEs ? 'Seleccionar un cliente' : 'Select a client'}
          </option>
          {clientOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </Select>
      </Field>

      <Field label={isEs ? 'Propiedad (opcional)' : 'Property (optional)'}>
        <Select value={propertyId} onChange={(e) => setPropertyId(e.target.value)}>
          <option value="">{isEs ? 'Ninguna' : 'None'}</option>
          {propertyOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </Select>
      </Field>

      {agentOptions ? (
        <Field label={isEs ? 'Asignar a agente (opcional)' : 'Assign to agent (optional)'}>
          <Select value={agentId} onChange={(e) => setAgentId(e.target.value)}>
            <option value="">{isEs ? 'Sin asignar' : 'Unassigned'}</option>
            {agentOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
      ) : null}

      <Field label={isEs ? 'Mensaje o consulta (opcional)' : 'Message (optional)'}>
        <Textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} />
      </Field>

      <Button type="submit" disabled={pending || !clientId}>
        {pending ? (isEs ? 'Guardando…' : 'Saving…') : isEs ? 'Crear prospecto' : 'Create lead'}
      </Button>
    </form>
  );
}

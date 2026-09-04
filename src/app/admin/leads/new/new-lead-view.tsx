'use client';

import { useTranslation } from '@/i18n/context';
import { LeadForm } from '../lead-form';

interface Option {
  id: string;
  label: string;
}

export function NewLeadView({
  clientOptions,
  propertyOptions,
  agentOptions,
}: {
  clientOptions: Option[];
  propertyOptions: Option[];
  agentOptions?: Option[];
}) {
  const { isEs } = useTranslation();

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl text-headline">{isEs ? 'Nuevo prospecto' : 'New lead'}</h1>
      <LeadForm
        clientOptions={clientOptions}
        propertyOptions={propertyOptions}
        agentOptions={agentOptions}
      />
    </div>
  );
}

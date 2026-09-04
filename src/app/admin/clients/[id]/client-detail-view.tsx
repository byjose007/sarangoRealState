'use client';

import Link from 'next/link';
import { useTranslation } from '@/i18n/context';
import { getStageLabel, getSourceLabel } from '@/lib/admin/labels';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ClientForm } from '../client-form';

interface ClientDetailViewProps {
  client: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    notes: string | null;
    createdAt: Date | string;
    leads: Array<{
      id: string;
      stage: string;
      source: string;
      createdAt: Date | string;
    }>;
  };
}

export function ClientDetailView({ client }: ClientDetailViewProps) {
  const { isEs, language } = useTranslation();

  return (
    <div className="max-w-2xl space-y-10">
      <div>
        <h1 className="text-2xl text-headline">
          {client.firstName} {client.lastName}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isEs ? 'Cliente registrado el ' : 'Client since '}
          {new Date(client.createdAt).toLocaleDateString(isEs ? 'es-EC' : 'en-US', {
            dateStyle: 'medium',
          })}
        </p>
      </div>

      <ClientForm
        clientId={client.id}
        initialValues={{
          firstName: client.firstName,
          lastName: client.lastName,
          email: client.email,
          phone: client.phone ?? '',
          notes: client.notes ?? '',
        }}
      />

      <Separator />

      <div>
        <h2 className="text-lg tracking-tight">
          {isEs ? 'Prospectos' : 'Leads'} ({client.leads.length})
        </h2>
        <ul className="mt-4 space-y-2">
          {client.leads.map((lead) => (
            <li key={lead.id}>
              <Link
                href={`/admin/leads/${lead.id}`}
                className="flex items-center justify-between gap-4 rounded-md border border-border px-4 py-3 text-sm transition-colors hover:border-primary/40"
              >
                <span>
                  <Badge variant="outline">{getStageLabel(lead.stage, language)}</Badge>
                  <span className="ml-2 text-muted-foreground">
                    {getSourceLabel(lead.source, language)}
                  </span>
                </span>
                <time className="font-mono text-xs text-muted-foreground">
                  {new Date(lead.createdAt).toLocaleDateString(isEs ? 'es-EC' : 'en-US', {
                    dateStyle: 'medium',
                  })}
                </time>
              </Link>
            </li>
          ))}
          {client.leads.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {isEs ? 'Aún no hay prospectos registrados.' : 'No leads yet.'}
            </p>
          ) : null}
        </ul>
      </div>
    </div>
  );
}

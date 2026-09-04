'use client';

import Link from 'next/link';
import { useTranslation } from '@/i18n/context';
import { getSourceLabel, getActivityActionLabel } from '@/lib/admin/labels';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { StageSelect } from '../stage-select';
import { ReassignLead } from './reassign';
import { AddNoteForm } from './notes';

interface LeadDetailViewProps {
  lead: {
    id: string;
    source: string;
    stage: string;
    message: string | null;
    assignedAgentId: string | null;
    client: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string | null;
    };
    property: {
      id: string;
      title: string;
      reference: string;
    } | null;
    assignedAgent: {
      name: string;
    } | null;
    notes: Array<{
      id: string;
      body: string;
      createdAt: Date | string;
      author: {
        email: string;
      };
    }>;
  };
  activity: Array<{
    id: string;
    action: string;
    createdAt: Date | string;
    actor: {
      email: string;
    } | null;
  }>;
  agentOptions?: Array<{
    id: string;
    name: string;
  }>;
}

export function LeadDetailView({ lead, activity, agentOptions }: LeadDetailViewProps) {
  const { isEs, language } = useTranslation();

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl text-headline">
          {lead.client.firstName} {lead.client.lastName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {getSourceLabel(lead.source, language)}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{isEs ? 'Cliente' : 'Client'}</CardTitle>
          </CardHeader>
          <CardBody className="space-y-1 text-sm">
            <p>
              <Link href={`/admin/clients/${lead.client.id}`} className="hover:underline">
                {lead.client.firstName} {lead.client.lastName}
              </Link>
            </p>
            <p className="text-muted-foreground">{lead.client.email}</p>
            {lead.client.phone ? (
              <p className="text-muted-foreground">{lead.client.phone}</p>
            ) : null}
          </CardBody>
        </Card>

        {lead.property ? (
          <Card>
            <CardHeader>
              <CardTitle>{isEs ? 'Propiedad' : 'Property'}</CardTitle>
            </CardHeader>
            <CardBody className="space-y-1 text-sm">
              <p>
                <Link href={`/admin/properties/${lead.property.id}`} className="hover:underline">
                  {lead.property.title}
                </Link>
              </p>
              <p className="font-mono text-xs text-muted-foreground">{lead.property.reference}</p>
            </CardBody>
          </Card>
        ) : null}
      </div>

      {lead.message ? (
        <Card>
          <CardHeader>
            <CardTitle>{isEs ? 'Mensaje o consulta' : 'Message'}</CardTitle>
          </CardHeader>
          <CardBody>
            <p className="whitespace-pre-line text-sm">{lead.message}</p>
          </CardBody>
        </Card>
      ) : null}

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <Label>{isEs ? 'Etapa' : 'Stage'}</Label>
          <StageSelect leadId={lead.id} stage={lead.stage} />
        </div>
        {agentOptions ? (
          <div>
            <Label>{isEs ? 'Agente asignado' : 'Assigned agent'}</Label>
            <ReassignLead
              leadId={lead.id}
              currentAgentId={lead.assignedAgentId}
              agentOptions={agentOptions}
            />
          </div>
        ) : lead.assignedAgent ? (
          <div>
            <Label>{isEs ? 'Agente asignado' : 'Assigned agent'}</Label>
            <p className="text-sm">{lead.assignedAgent.name}</p>
          </div>
        ) : null}
      </div>

      <Separator />

      <div>
        <h2 className="text-lg tracking-tight">{isEs ? 'Notas internas' : 'Notes'}</h2>
        <div className="mt-4 space-y-3">
          {lead.notes.map((note) => (
            <div key={note.id} className="rounded-md border border-border p-3 text-sm">
              <p className="whitespace-pre-line">{note.body}</p>
              <p className="mt-2 font-mono text-xs text-muted-foreground">
                {note.author.email} ·{' '}
                {new Date(note.createdAt).toLocaleString(isEs ? 'es-EC' : 'en-US', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </p>
            </div>
          ))}
          {lead.notes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {isEs ? 'Aún no hay notas registradas.' : 'No notes yet.'}
            </p>
          ) : null}
        </div>
        <div className="mt-4">
          <AddNoteForm leadId={lead.id} />
        </div>
      </div>

      <Separator />

      <div>
        <h2 className="text-lg tracking-tight">{isEs ? 'Historial de actividad' : 'Activity'}</h2>
        <div className="mt-4 space-y-2">
          {activity.map((entry) => (
            <div key={entry.id} className="flex items-baseline justify-between gap-4 text-sm">
              <p>
                <span className="text-muted-foreground">
                  {entry.actor?.email ?? (isEs ? 'Sistema' : 'System')}
                </span>{' '}
                {getActivityActionLabel(entry.action, language)}
              </p>
              <time className="shrink-0 font-mono text-xs text-muted-foreground">
                {new Date(entry.createdAt).toLocaleString(isEs ? 'es-EC' : 'en-US', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </time>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

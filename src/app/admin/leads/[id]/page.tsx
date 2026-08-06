import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAgentOrAdmin } from '@/lib/session';
import * as leadsCore from '@/lib/admin/leads';
import * as agentsCore from '@/lib/admin/agents';
import { AdminError } from '@/lib/admin/errors';
import { ACTIVITY_ACTION_LABELS, SOURCE_LABELS } from '@/lib/admin/labels';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { StageSelect } from '../stage-select';
import { ReassignLead } from './reassign';
import { AddNoteForm } from './notes';

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const actor = await requireAgentOrAdmin();

  const lead = await leadsCore.getLead(id, actor).catch((error) => {
    if (error instanceof AdminError) return null;
    throw error;
  });
  if (!lead) notFound();

  const [activity, agentOptions] = await Promise.all([
    leadsCore.getLeadActivity(lead.id),
    actor.role === 'ADMIN' ? agentsCore.listAgents(actor) : Promise.resolve(undefined),
  ]);

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-headline text-2xl">
          {lead.client.firstName} {lead.client.lastName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{SOURCE_LABELS[lead.source] ?? lead.source}</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Client</CardTitle>
          </CardHeader>
          <CardBody className="space-y-1 text-sm">
            <p>
              <Link href={`/admin/clients/${lead.client.id}`} className="hover:underline">
                {lead.client.firstName} {lead.client.lastName}
              </Link>
            </p>
            <p className="text-muted-foreground">{lead.client.email}</p>
            {lead.client.phone ? <p className="text-muted-foreground">{lead.client.phone}</p> : null}
          </CardBody>
        </Card>

        {lead.property ? (
          <Card>
            <CardHeader>
              <CardTitle>Property</CardTitle>
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
            <CardTitle>Message</CardTitle>
          </CardHeader>
          <CardBody>
            <p className="whitespace-pre-line text-sm">{lead.message}</p>
          </CardBody>
        </Card>
      ) : null}

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <Label>Stage</Label>
          <StageSelect leadId={lead.id} stage={lead.stage} />
        </div>
        {agentOptions ? (
          <div>
            <Label>Assigned agent</Label>
            <ReassignLead leadId={lead.id} currentAgentId={lead.assignedAgentId} agentOptions={agentOptions} />
          </div>
        ) : lead.assignedAgent ? (
          <div>
            <Label>Assigned agent</Label>
            <p className="text-sm">{lead.assignedAgent.name}</p>
          </div>
        ) : null}
      </div>

      <Separator />

      <div>
        <h2 className="text-lg tracking-tight">Notes</h2>
        <div className="mt-4 space-y-3">
          {lead.notes.map((note) => (
            <div key={note.id} className="rounded-md border border-border p-3 text-sm">
              <p className="whitespace-pre-line">{note.body}</p>
              <p className="mt-2 font-mono text-xs text-muted-foreground">
                {note.author.email} · {note.createdAt.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            </div>
          ))}
          {lead.notes.length === 0 ? <p className="text-sm text-muted-foreground">No notes yet.</p> : null}
        </div>
        <div className="mt-4">
          <AddNoteForm leadId={lead.id} />
        </div>
      </div>

      <Separator />

      <div>
        <h2 className="text-lg tracking-tight">Activity</h2>
        <div className="mt-4 space-y-2">
          {activity.map((entry) => (
            <div key={entry.id} className="flex items-baseline justify-between gap-4 text-sm">
              <p>
                <span className="text-muted-foreground">{entry.actor?.email ?? 'System'}</span>{' '}
                {ACTIVITY_ACTION_LABELS[entry.action] ?? entry.action.toLowerCase()}
              </p>
              <time className="shrink-0 font-mono text-xs text-muted-foreground">
                {entry.createdAt.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
              </time>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

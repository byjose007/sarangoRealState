import { sendMail } from '@/lib/mail';

interface AgentContact {
  email: string;
  name: string;
}

interface ClientContact {
  firstName: string;
  lastName: string;
}

function clientFullName(client: ClientContact) {
  return [client.firstName, client.lastName].filter(Boolean).join(' ');
}

export async function notifyAgentNewLead(agent: AgentContact, client: ClientContact, source: string, message?: string | null) {
  await sendMail({
    to: agent.email,
    subject: `New lead: ${clientFullName(client)}`,
    text: [
      `Hi ${agent.name},`,
      '',
      `You have a new lead from ${clientFullName(client)} (source: ${source}).`,
      message ? `\nMessage:\n${message}` : '',
      '',
      'Open the admin panel to follow up.',
    ]
      .filter(Boolean)
      .join('\n'),
  });
}

export async function notifyAgentLeadStageChanged(
  agent: AgentContact,
  client: ClientContact,
  fromStage: string,
  toStage: string,
) {
  await sendMail({
    to: agent.email,
    subject: `Lead update: ${clientFullName(client)} → ${toStage}`,
    text: `Hi ${agent.name},\n\nThe lead for ${clientFullName(client)} moved from ${fromStage} to ${toStage}.`,
  });
}

export async function notifyAgentLeadAssigned(agent: AgentContact, client: ClientContact) {
  await sendMail({
    to: agent.email,
    subject: `Lead assigned to you: ${clientFullName(client)}`,
    text: `Hi ${agent.name},\n\nA lead for ${clientFullName(client)} was just assigned to you. Open the admin panel to follow up.`,
  });
}

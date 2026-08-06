import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/session';
import * as agentsCore from '@/lib/admin/agents';
import { AdminError } from '@/lib/admin/errors';
import { AgentForm, type AgentFormValues } from '../agent-form';

export default async function EditAgentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const actor = await requireAdmin();

  const agent = await agentsCore.getAgent(id, actor).catch((error) => {
    if (error instanceof AdminError) return null;
    throw error;
  });
  if (!agent) notFound();

  const social = (agent.social ?? {}) as { tiktok?: string; instagram?: string; facebook?: string };
  const initialValues: Partial<AgentFormValues> = {
    slug: agent.slug,
    name: agent.name,
    role: agent.role,
    license: agent.license ?? '',
    avatar: agent.avatar,
    phone: agent.phone,
    email: agent.email,
    address: agent.address ?? '',
    citySlug: agent.citySlug,
    bio: agent.bio,
    languages: agent.languages.join(', '),
    specialties: agent.specialties.join(', '),
    experienceYears: String(agent.experienceYears),
    dealsClosed: String(agent.dealsClosed),
    rating: String(agent.rating),
    socialTiktok: social.tiktok ?? '',
    socialInstagram: social.instagram ?? '',
    socialFacebook: social.facebook ?? '',
  };

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-headline text-2xl">Edit agent</h1>
      <AgentForm agentId={agent.id} initialValues={initialValues} />
    </div>
  );
}

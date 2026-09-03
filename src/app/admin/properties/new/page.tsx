import { requireAgentOrAdmin } from '@/lib/session';
import * as agentsCore from '@/lib/admin/agents';
import { PropertyForm } from '../property-form';

export default async function NewPropertyPage() {
  const actor = await requireAgentOrAdmin();
  const agentOptions = actor.role === 'ADMIN' ? await agentsCore.listAgents(actor) : undefined;

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl text-headline">Nueva propiedad</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Publica un nuevo inmueble en el catálogo con sus datos, fotografías y especificaciones.
        </p>
      </div>
      <PropertyForm agentOptions={agentOptions} />
    </div>
  );
}

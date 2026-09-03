import { requireAgentOrAdmin } from '@/lib/session';
import * as propertiesCore from '@/lib/admin/properties';
import { PropertiesView } from './properties-view';

export default async function AdminPropertiesPage() {
  const actor = await requireAgentOrAdmin();
  const properties = await propertiesCore.listProperties(actor);

  return <PropertiesView properties={properties} />;
}

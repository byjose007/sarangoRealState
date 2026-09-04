import { notFound } from 'next/navigation';
import { requireAgentOrAdmin } from '@/lib/session';
import * as propertiesCore from '@/lib/admin/properties';
import * as agentsCore from '@/lib/admin/agents';
import { AdminError } from '@/lib/admin/errors';
import { PropertyForm, type PropertyFormValues } from '../property-form';
import { PropertyDocumentsSection } from './property-documents-section';
import { Separator } from '@/components/ui/separator';

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const actor = await requireAgentOrAdmin();

  const property = await propertiesCore.getProperty(id, actor).catch((error) => {
    if (error instanceof AdminError) return null;
    throw error;
  });
  if (!property) notFound();

  const agentOptions = actor.role === 'ADMIN' ? await agentsCore.listAgents(actor) : undefined;

  const initialValues: Partial<PropertyFormValues> = {
    reference: property.reference,
    slug: property.slug,
    title: property.title,
    description: property.description,
    status: property.status,
    type: property.type,
    pricePeriod: property.pricePeriod,
    price: String(property.price),
    address: property.address,
    citySlug: property.citySlug,
    lat: String(property.lat),
    lng: String(property.lng),
    bedrooms: String(property.bedrooms),
    bathrooms: String(property.bathrooms),
    garages: String(property.garages),
    area: String(property.area),
    landArea: String(property.landArea),
    yearBuilt: property.yearBuilt ? String(property.yearBuilt) : '',
    energyRating: property.energyRating ?? '',
    featured: property.featured,
    amenityIds: property.amenityIds,
    images: property.images.map((image) => image.url),
    nearby: Array.isArray(property.nearby)
      ? (property.nearby as { label: string; distance: number }[])
      : [],
    videoUrl: property.videoUrl ?? '',
    tourUrl: property.tourUrl ?? '',
    hoaFee: property.hoaFee ? String(property.hoaFee) : '',
    propertyTax: String(property.propertyTax),
    agentId: property.agentId,
    deposit: property.deposit ? String(property.deposit) : '',
    leaseTerm: property.leaseTerm ?? '',
    utilitiesIncluded:
      property.utilitiesIncluded != null ? String(property.utilitiesIncluded) : 'none',
    petsAllowed: property.petsAllowed != null ? String(property.petsAllowed) : 'none',
    floorLevel: property.floorLevel ?? '',
    commercialUse: property.commercialUse ?? '',
  };

  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl text-headline">{property.title}</h1>
        <p className="font-mono text-xs text-muted-foreground">{property.reference}</p>
      </div>

      <PropertyForm
        propertyId={property.id}
        initialValues={initialValues}
        agentOptions={agentOptions}
      />

      <Separator />

      <PropertyDocumentsSection propertyId={property.id} documents={property.documents} />
    </div>
  );
}

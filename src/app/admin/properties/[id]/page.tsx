import { notFound } from 'next/navigation';
import { requireAgentOrAdmin } from '@/lib/session';
import * as propertiesCore from '@/lib/admin/properties';
import * as agentsCore from '@/lib/admin/agents';
import { AdminError } from '@/lib/admin/errors';
import { PropertyForm, type PropertyFormValues } from '../property-form';
import { MediaManager } from '../media-manager';
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
    videoUrl: property.videoUrl ?? '',
    tourUrl: property.tourUrl ?? '',
    hoaFee: property.hoaFee ? String(property.hoaFee) : '',
    propertyTax: String(property.propertyTax),
    agentId: property.agentId,
  };

  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="text-headline text-2xl">{property.title}</h1>
        <p className="font-mono text-xs text-muted-foreground">{property.reference}</p>
      </div>

      <PropertyForm propertyId={property.id} initialValues={initialValues} agentOptions={agentOptions} />

      <Separator />

      <div>
        <h2 className="text-lg tracking-tight">Media</h2>
        <p className="mt-1 text-sm text-muted-foreground">Images and documents shown on the property page.</p>
        <div className="mt-4">
          <MediaManager
            propertyId={property.id}
            images={property.images.map((image) => ({ id: image.id, url: image.url }))}
            documents={property.documents}
          />
        </div>
      </div>
    </div>
  );
}

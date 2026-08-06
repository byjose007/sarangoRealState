'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { cities, amenities } from '@/data/reference';
import { createPropertyAction, updatePropertyAction } from '@/actions/properties';
import { Input, Label, Textarea, Select } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/admin/field';
import { PROPERTY_TYPE_LABELS, STATUS_LABELS } from '@/lib/admin/labels';

export interface PropertyFormValues {
  reference: string;
  slug: string;
  title: string;
  description: string;
  status: string;
  type: string;
  pricePeriod: string;
  price: string;
  address: string;
  citySlug: string;
  lat: string;
  lng: string;
  bedrooms: string;
  bathrooms: string;
  garages: string;
  area: string;
  landArea: string;
  yearBuilt: string;
  energyRating: string;
  featured: boolean;
  amenityIds: string[];
  videoUrl: string;
  tourUrl: string;
  hoaFee: string;
  propertyTax: string;
  agentId: string;
}

const EMPTY: PropertyFormValues = {
  reference: '',
  slug: '',
  title: '',
  description: '',
  status: 'FOR_SALE',
  type: 'VILLA',
  pricePeriod: 'TOTAL',
  price: '',
  address: '',
  citySlug: cities[0]?.slug ?? '',
  lat: '',
  lng: '',
  bedrooms: '0',
  bathrooms: '0',
  garages: '0',
  area: '',
  landArea: '0',
  yearBuilt: '',
  energyRating: '',
  featured: false,
  amenityIds: [],
  videoUrl: '',
  tourUrl: '',
  hoaFee: '',
  propertyTax: '0',
  agentId: '',
};

function num(value: string) {
  return value === '' ? undefined : Number(value);
}

function buildPayload(values: PropertyFormValues) {
  return {
    reference: values.reference,
    slug: values.slug,
    title: values.title,
    description: values.description,
    status: values.status,
    type: values.type,
    pricePeriod: values.pricePeriod,
    price: num(values.price) ?? 0,
    address: values.address,
    citySlug: values.citySlug,
    lat: num(values.lat) ?? 0,
    lng: num(values.lng) ?? 0,
    bedrooms: num(values.bedrooms) ?? 0,
    bathrooms: num(values.bathrooms) ?? 0,
    garages: num(values.garages) ?? 0,
    area: num(values.area) ?? 0,
    landArea: num(values.landArea) ?? 0,
    yearBuilt: num(values.yearBuilt),
    energyRating: values.energyRating || undefined,
    featured: values.featured,
    amenityIds: values.amenityIds,
    videoUrl: values.videoUrl || undefined,
    tourUrl: values.tourUrl || undefined,
    hoaFee: num(values.hoaFee),
    propertyTax: num(values.propertyTax) ?? 0,
    agentId: values.agentId || undefined,
  };
}

interface PropertyFormProps {
  propertyId?: string;
  initialValues?: Partial<PropertyFormValues>;
  agentOptions?: { id: string; name: string }[];
}

export function PropertyForm({ propertyId, initialValues, agentOptions }: PropertyFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<PropertyFormValues>({ ...EMPTY, ...initialValues });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const isEdit = Boolean(propertyId);

  function set<K extends keyof PropertyFormValues>(key: K, value: PropertyFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function toggleAmenity(id: string) {
    setValues((prev) => ({
      ...prev,
      amenityIds: prev.amenityIds.includes(id) ? prev.amenityIds.filter((a) => a !== id) : [...prev.amenityIds, id],
    }));
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});

    startTransition(async () => {
      const payload = buildPayload(values);
      const result = isEdit ? await updatePropertyAction(propertyId!, payload) : await createPropertyAction(payload);

      if (!result.ok) {
        setFormError(result.message);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }

      toast.success(result.message);
      if (isEdit) {
        router.refresh();
      } else {
        router.push(`/admin/properties/${result.data!.id}`);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {formError ? <p className="text-sm text-destructive">{formError}</p> : null}

      <section className="grid gap-5 sm:grid-cols-2">
        <Field label="Title" error={fieldErrors.title}>
          <Input value={values.title} onChange={(e) => set('title', e.target.value)} required />
        </Field>
        <Field label="Slug" error={fieldErrors.slug}>
          <Input value={values.slug} onChange={(e) => set('slug', e.target.value)} required />
        </Field>
        <Field label="Reference" error={fieldErrors.reference}>
          <Input value={values.reference} onChange={(e) => set('reference', e.target.value)} placeholder="VS-101-TX" required />
        </Field>
        {agentOptions ? (
          <Field label="Agent" error={fieldErrors.agentId}>
            <Select value={values.agentId} onChange={(e) => set('agentId', e.target.value)} required>
              <option value="" disabled>
                Select an agent
              </option>
              {agentOptions.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </Select>
          </Field>
        ) : null}
      </section>

      <Field label="Description" error={fieldErrors.description}>
        <Textarea rows={5} value={values.description} onChange={(e) => set('description', e.target.value)} required />
      </Field>

      <section className="grid gap-5 sm:grid-cols-3">
        <Field label="Status">
          <Select value={values.status} onChange={(e) => set('status', e.target.value)}>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Type">
          <Select value={values.type} onChange={(e) => set('type', e.target.value)}>
            {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Price period">
          <Select value={values.pricePeriod} onChange={(e) => set('pricePeriod', e.target.value)}>
            <option value="TOTAL">Total</option>
            <option value="MONTH">Per month</option>
          </Select>
        </Field>
      </section>

      <section className="grid gap-5 sm:grid-cols-3">
        <Field label="Price (USD)" error={fieldErrors.price}>
          <Input type="number" min={0} value={values.price} onChange={(e) => set('price', e.target.value)} required />
        </Field>
        <Field label="Property tax / yr">
          <Input type="number" min={0} value={values.propertyTax} onChange={(e) => set('propertyTax', e.target.value)} />
        </Field>
        <Field label="HOA fee / mo (optional)">
          <Input type="number" min={0} value={values.hoaFee} onChange={(e) => set('hoaFee', e.target.value)} />
        </Field>
      </section>

      <section className="grid gap-5 sm:grid-cols-2">
        <Field label="Address" error={fieldErrors.address}>
          <Input value={values.address} onChange={(e) => set('address', e.target.value)} required />
        </Field>
        <Field label="City">
          <Select value={values.citySlug} onChange={(e) => set('citySlug', e.target.value)}>
            {cities.map((city) => (
              <option key={city.slug} value={city.slug}>
                {city.name}, {city.state}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Latitude">
          <Input type="number" step="any" value={values.lat} onChange={(e) => set('lat', e.target.value)} required />
        </Field>
        <Field label="Longitude">
          <Input type="number" step="any" value={values.lng} onChange={(e) => set('lng', e.target.value)} required />
        </Field>
      </section>

      <section className="grid gap-5 sm:grid-cols-3 lg:grid-cols-6">
        <Field label="Bedrooms">
          <Input type="number" min={0} value={values.bedrooms} onChange={(e) => set('bedrooms', e.target.value)} />
        </Field>
        <Field label="Bathrooms">
          <Input type="number" min={0} value={values.bathrooms} onChange={(e) => set('bathrooms', e.target.value)} />
        </Field>
        <Field label="Garages">
          <Input type="number" min={0} value={values.garages} onChange={(e) => set('garages', e.target.value)} />
        </Field>
        <Field label="Area (sq ft)" error={fieldErrors.area}>
          <Input type="number" min={0} value={values.area} onChange={(e) => set('area', e.target.value)} required />
        </Field>
        <Field label="Land area">
          <Input type="number" min={0} value={values.landArea} onChange={(e) => set('landArea', e.target.value)} />
        </Field>
        <Field label="Year built">
          <Input type="number" value={values.yearBuilt} onChange={(e) => set('yearBuilt', e.target.value)} />
        </Field>
      </section>

      <section className="grid gap-5 sm:grid-cols-3">
        <Field label="Energy rating">
          <Select value={values.energyRating} onChange={(e) => set('energyRating', e.target.value)}>
            <option value="">—</option>
            {['A', 'B', 'C', 'D'].map((rating) => (
              <option key={rating} value={rating}>
                {rating}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Video URL">
          <Input value={values.videoUrl} onChange={(e) => set('videoUrl', e.target.value)} />
        </Field>
        <Field label="Virtual tour URL">
          <Input value={values.tourUrl} onChange={(e) => set('tourUrl', e.target.value)} />
        </Field>
      </section>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={values.featured}
          onChange={(e) => set('featured', e.target.checked)}
          className="size-4 rounded border-input"
        />
        Featured listing
      </label>

      <div>
        <Label>Amenities</Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {amenities.map((amenity) => (
            <label key={amenity.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={values.amenityIds.includes(amenity.id)}
                onChange={() => toggleAmenity(amenity.id)}
                className="size-4 rounded border-input"
              />
              {amenity.label}
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? 'Saving…' : isEdit ? 'Save changes' : 'Create property'}
        </Button>
      </div>
    </form>
  );
}

'use client';

import { useState, useTransition, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { cities, getAmenities } from '@/data/reference';
import { createPropertyAction, updatePropertyAction } from '@/actions/properties';
import { uploadImageAction } from '@/actions/uploadImage';
import { Input, Label, Textarea, Select } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/admin/field';
import {
  PROPERTY_TYPE_LABELS_ES,
  PROPERTY_TYPE_LABELS_EN,
  STATUS_LABELS_ES,
  STATUS_LABELS_EN,
} from '@/lib/admin/labels';
import { slugify, cn } from '@/lib/utils';
import { useTranslation } from '@/i18n/context';
import {
  Upload,
  Trash2,
  Star,
  ChevronLeft,
  ChevronRight,
  Plus,
  Sparkles,
  MapPin,
  Loader2,
  Image as ImageIcon,
  Link as LinkIcon,
  X,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

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
  images: string[];
  nearby: { label: string; distance: number }[];
  videoUrl: string;
  tourUrl: string;
  hoaFee: string;
  propertyTax: string;
  agentId: string;
  deposit: string;
  leaseTerm: string;
  utilitiesIncluded: string;
  petsAllowed: string;
  floorLevel: string;
  commercialUse: string;
}

/** Mirrors MAX_IMAGE_BYTES in src/lib/uploads.ts — kept here so the client can
 *  reject oversized files with a clear message before hitting the Server Action. */
const MAX_IMAGE_UPLOAD_BYTES = 10 * 1024 * 1024;

const defaultCity = cities[0] ?? { slug: 'cuenca', coordinates: { lat: -2.9001, lng: -79.0059 } };

function generateReference(citySlug: string = 'cuenca') {
  const code = citySlug.slice(0, 3).toUpperCase();
  const num = Math.floor(100 + Math.random() * 900);
  return `VS-${num}-${code}`;
}

const EMPTY: PropertyFormValues = {
  reference: generateReference(defaultCity.slug),
  slug: '',
  title: '',
  description: '',
  status: 'FOR_SALE',
  type: '',
  pricePeriod: 'TOTAL',
  price: '',
  address: '',
  citySlug: defaultCity.slug,
  lat: String(defaultCity.coordinates.lat),
  lng: String(defaultCity.coordinates.lng),
  bedrooms: '',
  bathrooms: '',
  garages: '',
  area: '',
  landArea: '',
  yearBuilt: '',
  energyRating: '',
  featured: false,
  amenityIds: [],
  images: [],
  nearby: [],
  videoUrl: '',
  tourUrl: '',
  hoaFee: '',
  propertyTax: '0',
  agentId: '',
  deposit: '',
  leaseTerm: '',
  utilitiesIncluded: 'none',
  petsAllowed: 'none',
  floorLevel: '',
  commercialUse: '',
};

function num(value: string) {
  return value === '' ? undefined : Number(value);
}

function getCityCoords(slug: string) {
  const found = cities.find((c) => c.slug === slug);
  return found?.coordinates ?? { lat: -2.9001, lng: -79.0059 };
}

interface DetectedAttributes {
  type?: string;
  typeLabel?: string;
  status?: string;
  statusLabel?: string;
  pricePeriod?: string;
}

function detectAttributesFromText(text: string, isEs: boolean): DetectedAttributes {
  const normalized = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const result: DetectedAttributes = {};

  // Status detection
  if (
    /\b(arriendo|arrienda|arrendar|alquiler|alquila|alquilar|renta|rentar|por mes|mensual)\b/.test(
      normalized,
    )
  ) {
    result.status = 'FOR_RENT';
    result.statusLabel = isEs ? 'En alquiler' : 'For rent';
    result.pricePeriod = 'MONTH';
  } else if (
    /\b(obra nueva|nuevo desarrollo|en planos|en construccion|preventa)\b/.test(normalized)
  ) {
    result.status = 'NEW_DEVELOPMENT';
    result.statusLabel = isEs ? 'Nuevo desarrollo' : 'New development';
    result.pricePeriod = 'TOTAL';
  } else if (/\b(venta|vende|se vende)\b/.test(normalized)) {
    result.status = 'FOR_SALE';
    result.statusLabel = isEs ? 'En venta' : 'For sale';
    result.pricePeriod = 'TOTAL';
  }

  // Type detection (ordered to prioritize composite terms)
  if (/\b(casa en conjunto|adosada|adosado|condominio|townhouse)\b/.test(normalized)) {
    result.type = 'TOWNHOUSE';
    result.typeLabel = isEs ? 'Casa en conjunto / Adosada' : 'Townhouse';
  } else if (
    /\b(departamento|departamentos|depto|deptos|apartamento|apartamentos|apto|aptos|flat|piso)\b/.test(
      normalized,
    )
  ) {
    result.type = 'APARTMENT';
    result.typeLabel = isEs ? 'Departamento' : 'Apartment';
  } else if (
    /\b(suite|suites|estudio|estudios|minidepartamento|mini departamento)\b/.test(normalized)
  ) {
    result.type = 'STUDIO';
    result.typeLabel = isEs ? 'Suite / Estudio' : 'Studio';
  } else if (/\b(penthouse|penthouses|atico)\b/.test(normalized)) {
    result.type = 'PENTHOUSE';
    result.typeLabel = isEs ? 'Ático / Penthouse' : 'Penthouse';
  } else if (/\b(quinta|quintas|finca|fincas|hacienda|haciendas)\b/.test(normalized)) {
    result.type = 'ESTATE';
    result.typeLabel = isEs ? 'Finca / Quinta' : 'Estate';
  } else if (/\b(terreno|terrenos|lote|lotes|solar)\b/.test(normalized)) {
    result.type = 'LAND';
    result.typeLabel = isEs ? 'Terreno / Lote' : 'Land';
  } else if (/\b(villa|villas)\b/.test(normalized)) {
    result.type = 'VILLA';
    result.typeLabel = isEs ? 'Villa' : 'Villa';
  } else if (/\b(loft|lofts)\b/.test(normalized)) {
    result.type = 'LOFT';
    result.typeLabel = isEs ? 'Loft' : 'Loft';
  } else if (/\b(oficina|oficinas|consultorio|consultorios)\b/.test(normalized)) {
    result.type = 'OFFICE';
    result.typeLabel = isEs ? 'Oficina' : 'Office';
  } else if (/\b(local|locales|comercial)\b/.test(normalized)) {
    result.type = 'COMMERCIAL';
    result.typeLabel = isEs ? 'Local comercial' : 'Commercial';
  } else if (/\b(casa|casas|residencia|residencial|vivienda)\b/.test(normalized)) {
    result.type = 'HOUSE';
    result.typeLabel = isEs ? 'Casa residencial' : 'House';
  }

  return result;
}

function buildPayload(values: PropertyFormValues) {
  return {
    reference: values.reference.trim(),
    slug: values.slug.trim(),
    title: values.title.trim(),
    description: values.description.trim(),
    status: values.status,
    type: values.type,
    pricePeriod: values.pricePeriod,
    price: num(values.price) ?? 0,
    address: values.address.trim(),
    citySlug: values.citySlug,
    lat: num(values.lat) ?? 0,
    lng: num(values.lng) ?? 0,
    bedrooms: num(values.bedrooms) ?? 0,
    bathrooms: num(values.bathrooms) ?? 0,
    garages: num(values.garages) ?? 0,
    area: num(values.area) ? Math.round(Number(values.area)) : 0,
    landArea: num(values.landArea) ? Math.round(Number(values.landArea)) : 0,
    yearBuilt: num(values.yearBuilt),
    energyRating: values.energyRating || undefined,
    featured: values.featured,
    amenityIds: values.amenityIds,
    images: values.images,
    nearby: values.nearby,
    videoUrl: values.videoUrl || undefined,
    tourUrl: values.tourUrl || undefined,
    hoaFee: num(values.hoaFee),
    propertyTax: num(values.propertyTax) ?? 0,
    agentId: values.agentId || undefined,
    deposit: num(values.deposit),
    leaseTerm: values.leaseTerm || undefined,
    utilitiesIncluded:
      values.utilitiesIncluded === 'true'
        ? true
        : values.utilitiesIncluded === 'false'
          ? false
          : undefined,
    petsAllowed:
      values.petsAllowed === 'true' ? true : values.petsAllowed === 'false' ? false : undefined,
    floorLevel: values.floorLevel || undefined,
    commercialUse: values.commercialUse || undefined,
  };
}

interface PropertyFormProps {
  propertyId?: string;
  initialValues?: Partial<PropertyFormValues>;
  agentOptions?: { id: string; name: string }[];
}

export function PropertyForm({ propertyId, initialValues, agentOptions }: PropertyFormProps) {
  const router = useRouter();
  const { isEs } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [values, setValues] = useState<PropertyFormValues>(() => {
    const initial = { ...EMPTY, ...initialValues };
    if (!initial.agentId && agentOptions && agentOptions.length > 0) {
      initial.agentId = agentOptions[0].id;
    }
    return initial;
  });

  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(Boolean(initialValues?.slug));
  const [isTypeManuallyEdited, setIsTypeManuallyEdited] = useState(
    Boolean(propertyId || initialValues?.type),
  );
  const [isStatusManuallyEdited, setIsStatusManuallyEdited] = useState(
    Boolean(propertyId || initialValues?.status),
  );
  const [autoDetectedInfo, setAutoDetectedInfo] = useState<{
    typeLabel?: string;
    statusLabel?: string;
  } | null>(null);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [isAddingUrl, setIsAddingUrl] = useState(false);
  const [dragging, setDragging] = useState(false);
  const dragCounter = useRef(0);

  // Nearby places state
  const [newNearbyLabel, setNewNearbyLabel] = useState('');
  const [newNearbyDistance, setNewNearbyDistance] = useState('');

  const isEdit = Boolean(propertyId);
  const statusDict = isEs ? STATUS_LABELS_ES : STATUS_LABELS_EN;
  const typeDict = isEs ? PROPERTY_TYPE_LABELS_ES : PROPERTY_TYPE_LABELS_EN;
  const amenitiesList = useMemo(() => getAmenities(isEs), [isEs]);

  const scrollToField = useCallback((fieldKey: string) => {
    const target =
      document.getElementById(`field-${fieldKey}`) ||
      document.getElementById(fieldKey) ||
      document.querySelector(`[name="${fieldKey}"]`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const input =
        target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA'
          ? target
          : target.querySelector('input, select, textarea');
      if (input instanceof HTMLElement) {
        input.focus();
      }
    }
  }, []);

  const completionStats = useMemo(() => {
    const requiredChecks = [
      { key: 'title', label: isEs ? 'Título' : 'Title', done: Boolean(values.title.trim()) },
      { key: 'slug', label: 'Slug', done: Boolean(values.slug.trim()) },
      {
        key: 'reference',
        label: isEs ? 'Referencia' : 'Reference',
        done: Boolean(values.reference.trim()),
      },
      ...(agentOptions && agentOptions.length > 0
        ? [{ key: 'agentId', label: isEs ? 'Agente' : 'Agent', done: Boolean(values.agentId) }]
        : []),
      {
        key: 'description',
        label: isEs ? 'Descripción' : 'Description',
        done: Boolean(values.description.trim()),
      },
      { key: 'status', label: isEs ? 'Estado' : 'Status', done: Boolean(values.status) },
      {
        key: 'type',
        label: isEs ? 'Tipo de inmueble' : 'Property type',
        done: Boolean(values.type),
      },
      { key: 'price', label: isEs ? 'Precio' : 'Price', done: Number(values.price) > 0 },
      {
        key: 'address',
        label: isEs ? 'Dirección' : 'Address',
        done: Boolean(values.address.trim()),
      },
      { key: 'citySlug', label: isEs ? 'Ciudad' : 'City', done: Boolean(values.citySlug) },
    ];

    const recommendedChecks = [
      { key: 'images', label: isEs ? 'Fotos' : 'Photos', done: values.images.length > 0 },
      {
        key: 'area',
        label: isEs ? 'Superficie' : 'Floor area',
        done: Number(values.area) > 0 || Number(values.landArea) > 0,
      },
      {
        key: 'amenities',
        label: isEs ? 'Amenidades' : 'Amenities',
        done: values.amenityIds.length > 0,
      },
    ];

    const totalRequired = requiredChecks.length;
    const doneRequired = requiredChecks.filter((c) => c.done).length;
    const missingRequired = requiredChecks.filter((c) => !c.done);

    const totalScoreItems = totalRequired + recommendedChecks.length;
    const scoreAchieved = doneRequired + recommendedChecks.filter((c) => c.done).length;
    const percentage = Math.round((scoreAchieved / totalScoreItems) * 100);

    return {
      requiredChecks,
      missingRequired,
      totalRequired,
      doneRequired,
      isReady: missingRequired.length === 0,
      percentage,
    };
  }, [values, isEs, agentOptions]);

  function set<K extends keyof PropertyFormValues>(key: K, value: PropertyFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleTitleChange(newTitle: string) {
    const sanitizedTitle = newTitle.replace(/^\t+/, '');
    const detected = detectAttributesFromText(sanitizedTitle, isEs);

    setValues((prev) => {
      const next = { ...prev, title: sanitizedTitle };
      if (!isSlugManuallyEdited) {
        next.slug = slugify(sanitizedTitle);
      }
      if (!isTypeManuallyEdited && detected.type) {
        next.type = detected.type;
        if (detected.type === 'LAND') {
          next.bedrooms = '0';
          next.bathrooms = '0';
        }
      }
      if (!isStatusManuallyEdited && detected.status) {
        next.status = detected.status;
        if (detected.pricePeriod) {
          next.pricePeriod = detected.pricePeriod;
        }
      }
      return next;
    });

    if (detected.typeLabel || detected.statusLabel) {
      setAutoDetectedInfo({
        typeLabel: !isTypeManuallyEdited ? detected.typeLabel : undefined,
        statusLabel: !isStatusManuallyEdited ? detected.statusLabel : undefined,
      });
    } else {
      setAutoDetectedInfo(null);
    }
  }

  function handleCityChange(newCitySlug: string) {
    const coords = getCityCoords(newCitySlug);
    setValues((prev) => ({
      ...prev,
      citySlug: newCitySlug,
      lat: String(coords.lat),
      lng: String(coords.lng),
    }));
  }

  function resetCoordsToCity() {
    const coords = getCityCoords(values.citySlug);
    setValues((prev) => ({
      ...prev,
      lat: String(coords.lat),
      lng: String(coords.lng),
    }));
    toast.info(isEs ? 'Coordenadas actualizadas según la ciudad.' : 'Coordinates reset to city.');
  }

  function handleAutoSlug() {
    if (!values.title) {
      toast.error(isEs ? 'Escribe primero un título' : 'Enter a title first');
      return;
    }
    set('slug', slugify(values.title));
    setIsSlugManuallyEdited(true);
    toast.success(isEs ? 'Slug generado' : 'Slug generated');
  }

  function handleGenerateReference() {
    const newRef = generateReference(values.citySlug);
    set('reference', newRef);
    toast.success(isEs ? `Referencia generada: ${newRef}` : `Reference generated: ${newRef}`);
  }

  function toggleAmenity(id: string) {
    setValues((prev) => ({
      ...prev,
      amenityIds: prev.amenityIds.includes(id)
        ? prev.amenityIds.filter((a) => a !== id)
        : [...prev.amenityIds, id],
    }));
  }

  // Media / Images management
  const handleFilesUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      setUploading(true);

      const uploadedUrls: string[] = [];
      const failures: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
          failures.push(
            isEs
              ? `${file.name}: supera el límite de 10MB (${(file.size / 1024 / 1024).toFixed(1)}MB).`
              : `${file.name}: exceeds the 10MB limit (${(file.size / 1024 / 1024).toFixed(1)}MB).`,
          );
          continue;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
          const res = await uploadImageAction(formData);
          if (res.ok && res.data?.url) {
            uploadedUrls.push(res.data.url);
          } else {
            failures.push(`${file.name}: ${res.message}`);
          }
        } catch {
          failures.push(
            isEs
              ? `${file.name}: no se pudo subir (archivo demasiado grande o error de red).`
              : `${file.name}: upload failed (file too large or network error).`,
          );
        }
      }

      if (uploadedUrls.length > 0) {
        setValues((prev) => ({
          ...prev,
          images: [...prev.images, ...uploadedUrls],
        }));
        toast.success(
          isEs
            ? `${uploadedUrls.length} ${uploadedUrls.length === 1 ? 'imagen subida' : 'imágenes subidas'}.`
            : `${uploadedUrls.length} image(s) uploaded.`,
        );
      }

      if (failures.length > 0) {
        toast.error(
          isEs
            ? `No se pudieron subir ${failures.length} archivo(s):`
            : `Failed to upload ${failures.length} file(s):`,
          { description: failures.join('\n') },
        );
      }

      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [isEs],
  );

  function handleDragEnter(event: React.DragEvent) {
    event.preventDefault();
    dragCounter.current += 1;
    setDragging(true);
  }
  function handleDragOver(event: React.DragEvent) {
    event.preventDefault();
  }
  function handleDragLeave(event: React.DragEvent) {
    event.preventDefault();
    dragCounter.current = Math.max(0, dragCounter.current - 1);
    if (dragCounter.current === 0) setDragging(false);
  }
  function handleDrop(event: React.DragEvent) {
    event.preventDefault();
    dragCounter.current = 0;
    setDragging(false);
    handleFilesUpload(event.dataTransfer.files);
  }

  function handleAddImageUrl() {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    if (
      !trimmed.startsWith('http://') &&
      !trimmed.startsWith('https://') &&
      !trimmed.startsWith('/')
    ) {
      toast.error(isEs ? 'Ingresa una URL válida (http/https)' : 'Enter a valid URL');
      return;
    }
    setValues((prev) => ({
      ...prev,
      images: [...prev.images, trimmed],
    }));
    setUrlInput('');
    setIsAddingUrl(false);
    toast.success(isEs ? 'Imagen añadida' : 'Image added');
  }

  function handleRemoveImage(index: number) {
    setValues((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  }

  function handleSetAsCover(index: number) {
    if (index === 0) return;
    setValues((prev) => {
      const copy = [...prev.images];
      const [item] = copy.splice(index, 1);
      copy.unshift(item);
      return { ...prev, images: copy };
    });
    toast.success(
      isEs ? 'Imagen seleccionada como portada principal' : 'Set as primary cover image',
    );
  }

  function handleMoveImage(index: number, direction: 'left' | 'right') {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    setValues((prev) => {
      if (targetIndex < 0 || targetIndex >= prev.images.length) return prev;
      const copy = [...prev.images];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return { ...prev, images: copy };
    });
  }

  // Nearby places
  function handleAddNearby() {
    const label = newNearbyLabel.trim();
    const distance = Number(newNearbyDistance);
    if (!label) {
      toast.error(isEs ? 'Indica el nombre del lugar' : 'Enter place name');
      return;
    }
    if (isNaN(distance) || distance < 0) {
      toast.error(isEs ? 'Indica una distancia válida en km' : 'Enter valid distance');
      return;
    }
    setValues((prev) => ({
      ...prev,
      nearby: [...prev.nearby, { label, distance }],
    }));
    setNewNearbyLabel('');
    setNewNearbyDistance('');
  }

  function handleRemoveNearby(index: number) {
    setValues((prev) => ({
      ...prev,
      nearby: prev.nearby.filter((_, i) => i !== index),
    }));
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const errors: Record<string, string> = {};
    if (!values.title.trim()) {
      errors.title = isEs ? 'El título es obligatorio.' : 'Title is required.';
    }
    if (!values.slug.trim()) {
      errors.slug = isEs ? 'El slug es obligatorio.' : 'Slug is required.';
    }
    if (!values.reference.trim()) {
      errors.reference = isEs ? 'La referencia es obligatoria.' : 'Reference is required.';
    }
    if (agentOptions && agentOptions.length > 0 && !values.agentId) {
      errors.agentId = isEs ? 'Debes seleccionar un agente responsable.' : 'Select an agent.';
    }
    if (!values.description.trim()) {
      errors.description = isEs ? 'La descripción es obligatoria.' : 'Description is required.';
    }
    if (!values.status) {
      errors.status = isEs ? 'Debes seleccionar el estado.' : 'Select a status.';
    }
    if (!values.type) {
      errors.type = isEs ? 'Debes seleccionar el tipo de inmueble.' : 'Select a property type.';
    }
    if (!values.price || Number(values.price) <= 0) {
      errors.price = isEs ? 'El precio debe ser mayor a 0.' : 'Price must be greater than 0.';
    }
    if (!values.address.trim()) {
      errors.address = isEs ? 'La dirección es obligatoria.' : 'Address is required.';
    }
    if (!values.citySlug) {
      errors.citySlug = isEs ? 'Selecciona una ciudad.' : 'Select a city.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const firstErrorKey = Object.keys(errors)[0];
      const count = Object.keys(errors).length;
      const message = isEs
        ? `Por favor completa ${count === 1 ? 'el campo obligatorio resaltado' : `los ${count} campos obligatorios resaltados`}.`
        : `Please complete the ${count} required highlighted field(s).`;
      setFormError(message);
      toast.error(message);
      setTimeout(() => scrollToField(firstErrorKey), 100);
      return;
    }

    startTransition(async () => {
      const payload = buildPayload(values);

      let result;
      try {
        result = isEdit
          ? await updatePropertyAction(propertyId!, payload)
          : await createPropertyAction(payload);
      } catch (error) {
        console.error('[property-form] save failed', error);
        const message =
          error instanceof Error &&
          /fetch|Failed to find Server Action|Unexpected/.test(error.message)
            ? isEs
              ? 'No se pudo guardar. Es posible que tu sesión haya expirado — recarga la página e inicia sesión de nuevo.'
              : 'Could not save. Your session may have expired — reload the page and sign in again.'
            : isEs
              ? 'No se pudo guardar por un error del servidor. Inténtalo de nuevo.'
              : 'Could not save due to a server error. Please try again.';
        setFormError(message);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      if (!result.ok) {
        setFormError(result.message);
        const returnedErrors = result.fieldErrors ?? {};
        setFieldErrors(returnedErrors);
        const firstErrorKey = Object.keys(returnedErrors)[0];
        if (firstErrorKey) {
          setTimeout(() => scrollToField(firstErrorKey), 100);
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
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
      {/* BANNER DE COMPLETITUD Y CAMPOS OBLIGATORIOS */}
      <div className="sticky top-16 z-20 rounded-xl border border-border bg-card/95 p-4 shadow-sm backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-foreground">
                {isEs ? 'Completitud de la publicación' : 'Listing completion'}:{' '}
                {completionStats.percentage}%
              </span>
              {completionStats.isReady ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[0.68rem] font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-3" />
                  {isEs ? 'Listo para publicar' : 'Ready to publish'}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 font-mono text-[0.68rem] font-semibold text-amber-600 dark:text-amber-400">
                  <AlertCircle className="size-3" />
                  {isEs
                    ? `Faltan ${completionStats.missingRequired.length} obligatorios`
                    : `${completionStats.missingRequired.length} required missing`}
                </span>
              )}
            </div>

            <div className="h-1.5 w-48 overflow-hidden rounded-full bg-muted sm:w-64">
              <div
                className={cn(
                  'h-full transition-all duration-500',
                  completionStats.isReady ? 'bg-emerald-500' : 'bg-primary',
                )}
                style={{ width: `${completionStats.percentage}%` }}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <p className="font-mono text-[0.68rem] text-muted-foreground">
              <span className="font-bold text-destructive">*</span>{' '}
              {isEs ? 'Campos obligatorios' : 'Required fields'}
            </p>
          </div>
        </div>

        {/* Píldoras para saltar a campos faltantes */}
        {!completionStats.isReady && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-border/60 pt-2.5 text-xs">
            <span className="text-muted-foreground">{isEs ? 'Pendientes:' : 'Missing:'}</span>
            {completionStats.missingRequired.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => scrollToField(item.key)}
                className="rounded-full border border-destructive/30 bg-destructive/5 px-2.5 py-0.5 text-[0.7rem] text-destructive transition-colors hover:bg-destructive/10"
              >
                + {item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {formError ? (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          {formError}
        </div>
      ) : null}

      {/* 1. INFORMACIÓN PRINCIPAL */}
      <div className="space-y-4">
        <h2 className="font-display text-lg tracking-tight text-foreground">
          {isEs ? 'Información básica' : 'Basic information'}
        </h2>
        <section className="grid gap-5 sm:grid-cols-2">
          <div>
            <Field
              id="field-title"
              label={isEs ? 'Título' : 'Title'}
              error={fieldErrors.title}
              required
            >
              <Input
                value={values.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder={
                  isEs
                    ? 'Ej. Villa Moderna en Puertas del Sol'
                    : 'e.g. Modern Villa in Puertas del Sol'
                }
                required
              />
            </Field>
            {autoDetectedInfo && (autoDetectedInfo.typeLabel || autoDetectedInfo.statusLabel) ? (
              <div className="mt-1.5 flex items-center gap-1.5 font-mono text-[0.68rem] text-primary">
                <Sparkles className="size-3 shrink-0 animate-pulse text-primary" />
                <span>
                  {isEs ? 'Detectado automáticamente: ' : 'Auto-detected: '}
                  <strong className="font-semibold">
                    {[autoDetectedInfo.typeLabel, autoDetectedInfo.statusLabel]
                      .filter(Boolean)
                      .join(' · ')}
                  </strong>
                </span>
              </div>
            ) : null}
          </div>

          <Field
            id="field-slug"
            label="Slug (URL)"
            error={fieldErrors.slug}
            required
            hint={isEs ? 'Identificador para la URL de la propiedad' : 'URL path identifier'}
          >
            <div className="flex gap-2">
              <Input
                value={values.slug}
                onChange={(e) => {
                  setIsSlugManuallyEdited(true);
                  set('slug', e.target.value);
                }}
                placeholder="villa-moderna-en-puertas-del-sol"
                required
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAutoSlug}
                title={isEs ? 'Autogenerar slug desde el título' : 'Auto-generate slug from title'}
                className="shrink-0 px-3"
              >
                <Sparkles className="size-4" />
              </Button>
            </div>
          </Field>

          <Field
            id="field-reference"
            label={isEs ? 'Referencia / Código' : 'Reference'}
            error={fieldErrors.reference}
            required
          >
            <div className="flex gap-2">
              <Input
                value={values.reference}
                onChange={(e) => set('reference', e.target.value)}
                placeholder="VS-101-CUE"
                required
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGenerateReference}
                title={isEs ? 'Generar nuevo código único' : 'Generate new unique code'}
                className="shrink-0 text-xs"
              >
                {isEs ? 'Generar' : 'Generate'}
              </Button>
            </div>
          </Field>

          {agentOptions ? (
            <Field
              id="field-agentId"
              label={isEs ? 'Agente responsable' : 'Agent'}
              error={fieldErrors.agentId}
              required
            >
              <Select
                value={values.agentId}
                onChange={(e) => set('agentId', e.target.value)}
                required
              >
                <option value="" disabled>
                  {isEs ? 'Seleccionar un agente' : 'Select an agent'}
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

        <Field
          id="field-description"
          label={isEs ? 'Descripción detallada' : 'Description'}
          error={fieldErrors.description}
          required
        >
          <div className="space-y-1.5">
            <Textarea
              rows={8}
              value={values.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder={
                isEs
                  ? 'Describe los acabados, distribución, comodidades y ventajas de la propiedad...'
                  : 'Describe finishes, layout, amenities, and lifestyle highlights...'
              }
              className="whitespace-pre-wrap leading-relaxed"
              required
            />
            <p className="text-[0.72rem] text-muted-foreground">
              {isEs
                ? 'Nota: Se respetarán todos los saltos de línea y listas con emojis al publicarse.'
                : 'Note: All line breaks and emoji lists will be preserved when published.'}
            </p>
          </div>
        </Field>
      </div>

      {/* 2. SUBIDA DE IMÁGENES / GALERÍA */}
      <div className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ImageIcon className="size-5 text-primary" />
              <h2 className="font-display text-lg tracking-tight text-foreground">
                {isEs ? 'Fotografías y Galería' : 'Property Photos & Gallery'}
              </h2>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 font-mono text-xs font-medium text-primary">
                {values.images.length}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {isEs
                ? 'Sube fotos en alta calidad. La primera imagen se usará como portada principal de la propiedad.'
                : 'Upload high-quality images. The first image will be used as the primary cover photo.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddingUrl(!isAddingUrl)}
              className="gap-1.5 text-xs"
            >
              <LinkIcon className="size-3.5" />
              {isEs ? 'Añadir por URL' : 'Add by URL'}
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="gap-1.5 text-xs"
            >
              {uploading ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Upload className="size-3.5" />
              )}
              {uploading
                ? isEs
                  ? 'Subiendo...'
                  : 'Uploading...'
                : isEs
                  ? 'Subir fotos'
                  : 'Upload photos'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/jpg,image/pjpeg,image/png,image/webp,image/avif,.jpeg,.jpg,.png,.webp,.avif"
              className="hidden"
              onChange={(e) => handleFilesUpload(e.target.files)}
            />
          </div>
        </div>

        {/* Input para agregar por URL */}
        {isAddingUrl ? (
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 p-3">
            <Input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://images.unsplash.com/... o enlace de imagen"
              className="h-9 text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddImageUrl();
                }
              }}
            />
            <Button type="button" size="sm" onClick={handleAddImageUrl} className="shrink-0">
              <Plus className="size-3.5" /> {isEs ? 'Agregar' : 'Add'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsAddingUrl(false)}
              className="shrink-0 px-2"
            >
              <X className="size-4" />
            </Button>
          </div>
        ) : null}

        {/* Galería de miniaturas — también funciona como zona de arrastrar y soltar */}
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`rounded-lg border-2 border-dashed p-2 transition-colors ${
            dragging ? 'border-primary bg-primary-soft/40' : 'border-transparent'
          }`}
        >
          {values.images.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {values.images.map((imgUrl, index) => {
                const isCover = index === 0;
                return (
                  <div
                    key={`${imgUrl}-${index}`}
                    className={`group relative aspect-[4/3] overflow-hidden rounded-lg border transition-all ${
                      isCover ? 'border-primary ring-2 ring-primary/30' : 'border-border'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imgUrl}
                      alt={`Property ${index + 1}`}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />

                    {/* Badge de portada */}
                    {isCover ? (
                      <div className="absolute left-2 top-2 z-10 flex items-center gap-1 rounded bg-primary px-2 py-0.5 font-mono text-[0.65rem] font-semibold uppercase tracking-wider text-primary-foreground shadow">
                        <Star className="size-3 fill-primary-foreground" />
                        {isEs ? 'Portada' : 'Cover'}
                      </div>
                    ) : null}

                    {/* Botones de acción overlay */}
                    <div className="absolute inset-0 flex flex-col justify-between bg-black/50 p-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <div className="flex items-center justify-between">
                        {!isCover ? (
                          <button
                            type="button"
                            onClick={() => handleSetAsCover(index)}
                            className="flex items-center gap-1 rounded bg-black/60 px-2 py-1 text-[0.7rem] font-medium text-white backdrop-blur hover:bg-primary"
                            title={
                              isEs
                                ? 'Marcar como foto de portada principal'
                                : 'Set as primary cover'
                            }
                          >
                            <Star className="size-3" />
                            {isEs ? 'Hacer portada' : 'Set cover'}
                          </button>
                        ) : (
                          <span />
                        )}

                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="rounded-full bg-destructive/90 p-1.5 text-destructive-foreground transition-colors hover:bg-destructive"
                          title={isEs ? 'Eliminar imagen' : 'Remove image'}
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>

                      {/* Controles de reordenar */}
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMoveImage(index, 'left')}
                          className="rounded bg-black/60 p-1 text-white hover:bg-black/90 disabled:opacity-30"
                          title={isEs ? 'Mover antes' : 'Move earlier'}
                        >
                          <ChevronLeft className="size-4" />
                        </button>
                        <span className="font-mono text-xs text-white/90">
                          {index + 1} / {values.images.length}
                        </span>
                        <button
                          type="button"
                          disabled={index === values.images.length - 1}
                          onClick={() => handleMoveImage(index, 'right')}
                          className="rounded bg-black/60 p-1 text-white hover:bg-black/90 disabled:opacity-30"
                          title={isEs ? 'Mover después' : 'Move later'}
                        >
                          <ChevronRight className="size-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border/80 bg-muted/20 p-8 text-center transition-colors hover:border-primary/50 hover:bg-muted/40"
            >
              <div className="rounded-full bg-muted p-3 text-muted-foreground">
                <Upload className="size-6" />
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">
                {isEs
                  ? 'Haz clic para subir fotos o arrastra archivos aquí'
                  : 'Click to upload photos or drag and drop'}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {isEs
                  ? 'Soporta JPEG, JPG, PNG, WebP o AVIF (hasta 10MB c/u)'
                  : 'Supports JPEG, JPG, PNG, WebP or AVIF (up to 10MB each)'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 3. CLASIFICACIÓN Y PRECIO */}
      <div className="space-y-4">
        <h2 className="font-display text-lg tracking-tight text-foreground">
          {isEs ? 'Clasificación y Precio' : 'Classification & Pricing'}
        </h2>
        <section className="grid gap-5 sm:grid-cols-3">
          <Field
            id="field-status"
            label={isEs ? 'Estado' : 'Status'}
            error={fieldErrors.status}
            required
          >
            <Select
              value={values.status}
              onChange={(e) => {
                setIsStatusManuallyEdited(true);
                set('status', e.target.value);
              }}
            >
              {Object.entries(statusDict).map(([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field
            id="field-type"
            label={isEs ? 'Tipo de inmueble' : 'Property type'}
            error={fieldErrors.type}
            required
          >
            <Select
              value={values.type}
              onChange={(e) => {
                const nextType = e.target.value;
                setIsTypeManuallyEdited(true);
                setValues((prev) => ({
                  ...prev,
                  type: nextType,
                  ...(nextType === 'LAND' ? { bedrooms: '0', bathrooms: '0' } : {}),
                }));
              }}
            >
              <option value="" disabled>
                {isEs ? '— Selecciona el tipo de inmueble —' : '— Select property type —'}
              </option>
              {Object.entries(typeDict).map(([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field
            id="field-pricePeriod"
            label={isEs ? 'Período del precio' : 'Price period'}
            required
          >
            <Select value={values.pricePeriod} onChange={(e) => set('pricePeriod', e.target.value)}>
              <option value="TOTAL">{isEs ? 'Precio total (Venta)' : 'Total (Sale)'}</option>
              <option value="MONTH">{isEs ? 'Por mes (Alquiler)' : 'Per month (Rent)'}</option>
            </Select>
          </Field>
        </section>

        <section className="grid gap-5 sm:grid-cols-3">
          <Field
            id="field-price"
            label={isEs ? 'Precio (USD)' : 'Price (USD)'}
            error={fieldErrors.price}
            required
          >
            <div>
              <Input
                type="number"
                min={0}
                value={values.price}
                onChange={(e) => set('price', e.target.value)}
                placeholder="385000"
                required
              />
              {values.price && Number(values.price) > 0 ? (
                <p className="mt-1 font-mono text-[0.72rem] text-emerald-600 dark:text-emerald-400">
                  {isEs ? 'Monto: ' : 'Formatted: '}
                  <strong className="font-semibold">
                    ${Number(values.price).toLocaleString('en-US')} USD
                    {values.pricePeriod === 'MONTH' ? (isEs ? ' / mes' : ' / mo') : ''}
                  </strong>
                </p>
              ) : null}
            </div>
          </Field>
          <Field
            id="field-propertyTax"
            label={isEs ? 'Impuesto predial / año (USD)' : 'Property tax / yr'}
            optional
          >
            <Input
              type="number"
              min={0}
              value={values.propertyTax}
              onChange={(e) => set('propertyTax', e.target.value)}
              placeholder="0"
            />
          </Field>
          <Field
            id="field-hoaFee"
            label={isEs ? 'Alícuota / expensas / mes' : 'HOA fee / mo'}
            optional
          >
            <Input
              type="number"
              min={0}
              value={values.hoaFee}
              onChange={(e) => set('hoaFee', e.target.value)}
              placeholder="0"
            />
          </Field>
        </section>

        {/* CONDICIONES DE ARRIENDO (OPCIONAL) */}
        <div className="space-y-4 rounded-lg border border-border bg-muted/20 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-foreground">
              {isEs ? 'Condiciones de Arriendo' : 'Rental Conditions'}
            </h3>
            <span className="font-mono text-[0.68rem] uppercase text-muted-foreground">
              {isEs ? 'Para propiedades en arriendo (Opcional)' : 'For rental listings (Optional)'}
            </span>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Field
              id="field-deposit"
              label={isEs ? 'Garantía (USD)' : 'Security Deposit (USD)'}
              optional
            >
              <Input
                type="number"
                min={0}
                value={values.deposit}
                onChange={(e) => set('deposit', e.target.value)}
                placeholder="320"
              />
            </Field>
            <Field
              id="field-leaseTerm"
              label={isEs ? 'Contrato mínimo' : 'Min lease term'}
              optional
            >
              <Input
                value={values.leaseTerm}
                onChange={(e) => set('leaseTerm', e.target.value)}
                placeholder={isEs ? '1 año' : '1 year'}
              />
            </Field>
            <Field
              id="field-utilitiesIncluded"
              label={isEs ? 'Servicios básicos' : 'Utilities included'}
              optional
            >
              <Select
                value={values.utilitiesIncluded}
                onChange={(e) => set('utilitiesIncluded', e.target.value)}
              >
                <option value="none">{isEs ? 'No especificado' : 'Not specified'}</option>
                <option value="true">
                  {isEs ? 'Incluidos en el canon 💧' : 'Included in rent'}
                </option>
                <option value="false">
                  {isEs ? 'No incluidos (por separado)' : 'Excluded / Separate'}
                </option>
              </Select>
            </Field>
            <Field
              id="field-petsAllowed"
              label={isEs ? 'Política de mascotas' : 'Pets policy'}
              optional
            >
              <Select
                value={values.petsAllowed}
                onChange={(e) => set('petsAllowed', e.target.value)}
              >
                <option value="none">{isEs ? 'No especificado' : 'Not specified'}</option>
                <option value="false">
                  {isEs ? '🚫 No se aceptan mascotas' : 'No pets allowed'}
                </option>
                <option value="true">{isEs ? '🐾 Se admiten mascotas' : 'Pets allowed'}</option>
              </Select>
            </Field>
          </div>
        </div>
      </div>

      {/* 4. UBICACIÓN Y COORDENADAS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg tracking-tight text-foreground">
            {isEs ? 'Ubicación geográfica' : 'Location'}
          </h2>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={resetCoordsToCity}
            className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <MapPin className="size-3.5 text-primary" />
            {isEs ? 'Usar coordenadas de la ciudad' : 'Use city coordinates'}
          </Button>
        </div>

        <section className="grid gap-5 sm:grid-cols-2">
          <Field
            id="field-address"
            label={isEs ? 'Dirección' : 'Address'}
            error={fieldErrors.address}
            required
          >
            <Input
              value={values.address}
              onChange={(e) => set('address', e.target.value)}
              placeholder={
                isEs ? 'Ej. Av. Ordoñez Lasso y Calle del Ciprés' : 'e.g. Ordoñez Lasso Ave'
              }
              required
            />
          </Field>
          <Field id="field-citySlug" label={isEs ? 'Ciudad' : 'City'} required>
            <Select value={values.citySlug} onChange={(e) => handleCityChange(e.target.value)}>
              <option value="cuenca">Cuenca, Azuay ({isEs ? 'Operación activa' : 'Active'})</option>
              <optgroup label={isEs ? 'Próxima expansión nacional' : 'Upcoming national expansion'}>
                {cities
                  .filter((c) => c.slug !== 'cuenca')
                  .map((city) => (
                    <option key={city.slug} value={city.slug}>
                      {city.name}, {city.state} ({isEs ? 'Próximamente' : 'Coming soon'})
                    </option>
                  ))}
              </optgroup>
            </Select>
          </Field>
          <Field
            id="field-lat"
            label={isEs ? 'Latitud GPS' : 'Latitude'}
            error={fieldErrors.lat}
            required
          >
            <Input
              type="number"
              step="any"
              value={values.lat}
              onChange={(e) => set('lat', e.target.value)}
              placeholder="-2.9001"
              required
            />
          </Field>
          <Field
            id="field-lng"
            label={isEs ? 'Longitud GPS' : 'Longitude'}
            error={fieldErrors.lng}
            required
          >
            <Input
              type="number"
              step="any"
              value={values.lng}
              onChange={(e) => set('lng', e.target.value)}
              placeholder="-79.0059"
              required
            />
          </Field>
        </section>
      </div>

      {/* 5. DIMENSIONES Y CARACTERÍSTICAS */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-lg tracking-tight text-foreground">
              {isEs ? 'Dimensiones y Capacidad' : 'Specs & Capacity'}
            </h2>
            <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[0.68rem] font-medium uppercase tracking-wider text-muted-foreground">
              {isEs ? 'Opcional' : 'Optional'}
            </span>
          </div>
          {values.type === 'LAND' ? (
            <span className="rounded-full bg-primary/10 px-3 py-1 font-mono text-[0.7rem] font-medium text-primary">
              {isEs
                ? 'Terreno / Lote: Se prioriza el área de terreno (m²)'
                : 'Land / Lot: Land area (m²) prioritized'}
            </span>
          ) : null}
        </div>
        <section className="grid gap-5 sm:grid-cols-3 lg:grid-cols-6">
          <Field
            id="field-bedrooms"
            label={isEs ? 'Habitaciones' : 'Bedrooms'}
            className={values.type === 'LAND' ? 'opacity-50' : ''}
            optional
          >
            <Input
              type="number"
              min={0}
              value={values.bedrooms}
              onChange={(e) => set('bedrooms', e.target.value)}
              placeholder="0"
              disabled={values.type === 'LAND'}
            />
          </Field>
          <Field
            id="field-bathrooms"
            label={isEs ? 'Baños' : 'Bathrooms'}
            className={values.type === 'LAND' ? 'opacity-50' : ''}
            optional
          >
            <Input
              type="number"
              min={0}
              value={values.bathrooms}
              onChange={(e) => set('bathrooms', e.target.value)}
              placeholder="0"
              disabled={values.type === 'LAND'}
            />
          </Field>
          <Field id="field-garages" label={isEs ? 'Estacionamientos' : 'Garages'} optional>
            <Input
              type="number"
              min={0}
              value={values.garages}
              onChange={(e) => set('garages', e.target.value)}
              placeholder="0"
            />
          </Field>
          <Field
            id="field-area"
            label={
              isEs
                ? values.type === 'LAND'
                  ? 'Superficie total (m²)'
                  : 'Superficie const. (m²)'
                : 'Floor area (sq ft)'
            }
            error={fieldErrors.area}
            optional
          >
            <Input
              type="number"
              min={0}
              step="any"
              value={values.area}
              onChange={(e) => set('area', e.target.value)}
              placeholder={isEs ? 'Opcional (ej: 180)' : 'Optional (e.g. 180)'}
            />
          </Field>
          <Field
            id="field-landArea"
            label={isEs ? 'Superficie terreno (m²)' : 'Land area (m²)'}
            className={values.type === 'LAND' ? 'font-semibold text-primary' : ''}
            optional
          >
            <Input
              type="number"
              min={0}
              step="any"
              value={values.landArea}
              onChange={(e) => {
                const val = e.target.value;
                set('landArea', val);
                if (values.type === 'LAND' && (!values.area || values.area === '0')) {
                  set('area', val);
                }
              }}
              placeholder={isEs ? 'Opcional (ej: 250)' : 'Optional (e.g. 250)'}
              className={values.type === 'LAND' ? 'border-primary ring-1 ring-primary/20' : ''}
            />
          </Field>
          <Field id="field-yearBuilt" label={isEs ? 'Año de const.' : 'Year built'} optional>
            <Input
              type="number"
              value={values.yearBuilt}
              onChange={(e) => set('yearBuilt', e.target.value)}
              placeholder="2024"
            />
          </Field>
        </section>

        <section className="grid gap-5 sm:grid-cols-2">
          <Field
            id="field-floorLevel"
            label={isEs ? 'Nivel / Pisos en el edificio' : 'Floor / Building levels'}
            optional
          >
            <Input
              value={values.floorLevel}
              onChange={(e) => set('floorLevel', e.target.value)}
              placeholder={
                isEs
                  ? 'Ej: Pisos 2 al 4 / Planta Baja / Piso 3'
                  : 'e.g. Floors 2-4 / Ground Floor / 3rd Floor'
              }
            />
          </Field>
          <Field
            id="field-commercialUse"
            label={isEs ? 'Uso comercial sugerido / Ideal para' : 'Ideal commercial use'}
            optional
          >
            <Input
              value={values.commercialUse}
              onChange={(e) => set('commercialUse', e.target.value)}
              placeholder={
                isEs
                  ? 'Ej: Oficinas corporativas, consultorios, coworking, academias'
                  : 'e.g. Offices, clinics, coworking'
              }
            />
          </Field>
        </section>
      </div>

      {/* 6. PUNTOS DE INTERÉS CERCANOS */}
      <div className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
        <div>
          <h2 className="font-display text-lg tracking-tight text-foreground">
            {isEs ? 'Lugares de Interés Cercanos' : 'Nearby Points of Interest'}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {isEs
              ? 'Agrega centros comerciales, hospitales, colegios o vías rápidas cercanas con su distancia aproximada.'
              : 'Add key points of interest such as hospitals, schools, shopping centers, and transport.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Input
            value={newNearbyLabel}
            onChange={(e) => setNewNearbyLabel(e.target.value)}
            placeholder={
              isEs ? 'Ej. Hospital del Río, Supermaxi' : 'e.g. City Hospital, Metro Station'
            }
            className="min-w-[200px] flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddNearby();
              }
            }}
          />
          <Input
            type="number"
            step="0.1"
            min={0}
            value={newNearbyDistance}
            onChange={(e) => setNewNearbyDistance(e.target.value)}
            placeholder={isEs ? 'Distancia en km (ej. 1.2)' : 'Distance in km (e.g. 1.2)'}
            className="w-44"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddNearby();
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddNearby}
            className="shrink-0 gap-1.5"
          >
            <Plus className="size-3.5" />
            {isEs ? 'Agregar lugar' : 'Add place'}
          </Button>
        </div>

        {values.nearby.length > 0 ? (
          <div className="flex flex-wrap gap-2 pt-2">
            {values.nearby.map((place, index) => (
              <span
                key={`${place.label}-${index}`}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-medium text-foreground"
              >
                <span>{place.label}</span>
                <span className="font-mono text-[0.7rem] text-primary">{place.distance} km</span>
                <button
                  type="button"
                  onClick={() => handleRemoveNearby(index)}
                  className="rounded-full p-0.5 hover:bg-destructive/20 hover:text-destructive"
                  aria-label="Remove nearby place"
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs italic text-muted-foreground">
            {isEs ? 'No se han agregado lugares cercanos.' : 'No nearby places added yet.'}
          </p>
        )}
      </div>

      {/* 7. RECURSOS MULTIMEDIA Y ENERGÍA */}
      <div className="space-y-4">
        <h2 className="font-display text-lg tracking-tight text-foreground">
          {isEs ? 'Multimedia y Certificación' : 'Media links & Certification'}
        </h2>
        <section className="grid gap-5 sm:grid-cols-3">
          <Field
            id="field-energyRating"
            label={isEs ? 'Eficiencia energética' : 'Energy rating'}
            optional
          >
            <Select
              value={values.energyRating}
              onChange={(e) => set('energyRating', e.target.value)}
            >
              <option value="">—</option>
              {['A', 'B', 'C', 'D'].map((rating) => (
                <option key={rating} value={rating}>
                  {isEs ? `Clase ${rating}` : `Rating ${rating}`}
                </option>
              ))}
            </Select>
          </Field>
          <Field
            id="field-videoUrl"
            label={isEs ? 'URL Video (YouTube/Vimeo)' : 'Video URL'}
            optional
          >
            <Input
              value={values.videoUrl}
              onChange={(e) => set('videoUrl', e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </Field>
          <Field
            id="field-tourUrl"
            label={isEs ? 'URL Tour Virtual (Matterport)' : 'Virtual tour URL'}
            optional
          >
            <Input
              value={values.tourUrl}
              onChange={(e) => set('tourUrl', e.target.value)}
              placeholder="https://my.matterport.com/show/?m=..."
            />
          </Field>
        </section>
      </div>

      {/* 8. LISTADO DESTACADO */}
      <div className="rounded-lg border border-border/70 bg-card/60 p-4">
        <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-foreground">
          <input
            type="checkbox"
            checked={values.featured}
            onChange={(e) => set('featured', e.target.checked)}
            className="size-4 rounded border-input accent-primary"
          />
          <div>
            <span>{isEs ? 'Destacar propiedad' : 'Featured listing'}</span>
            <p className="text-xs font-normal text-muted-foreground">
              {isEs
                ? 'Aparecerá en el carrusel de propiedades exclusivas en la página principal.'
                : 'Highlighted in the curated carousel on the homepage.'}
            </p>
          </div>
        </label>
      </div>

      {/* 9. AMENIDADES */}
      <div className="space-y-3">
        <div>
          <Label className="text-base font-semibold">
            {isEs ? 'Amenidades y Servicios' : 'Amenities'}
          </Label>
          <p className="text-xs text-muted-foreground">
            {isEs
              ? 'Selecciona las comodidades que incluye este inmueble.'
              : 'Select all features available in this property.'}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
          {amenitiesList.map((amenity) => (
            <label
              key={amenity.id}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border p-2.5 text-xs transition-colors ${
                values.amenityIds.includes(amenity.id)
                  ? 'border-primary bg-primary-soft font-medium text-foreground'
                  : 'border-border bg-card text-muted-foreground hover:bg-muted'
              }`}
            >
              <input
                type="checkbox"
                checked={values.amenityIds.includes(amenity.id)}
                onChange={() => toggleAmenity(amenity.id)}
                className="size-3.5 rounded border-input accent-primary"
              />
              <span className="truncate">{amenity.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* BOTONES DE ACCIÓN */}
      <div className="flex items-center gap-4 border-t border-border pt-6">
        <Button type="submit" size="lg" disabled={pending || uploading} className="min-w-[160px]">
          {pending ? (
            <span className="flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" />
              {isEs ? 'Guardando…' : 'Saving…'}
            </span>
          ) : isEdit ? (
            isEs ? (
              'Guardar cambios'
            ) : (
              'Save changes'
            )
          ) : isEs ? (
            'Crear propiedad'
          ) : (
            'Create property'
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => router.push('/admin/properties')}
          disabled={pending}
        >
          {isEs ? 'Cancelar' : 'Cancel'}
        </Button>
      </div>
    </form>
  );
}

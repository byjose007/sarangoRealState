'use client';

import type { ComponentProps } from 'react';
import { useTranslation } from '@/i18n/context';
import { MediaManager } from '../media-manager';

export function PropertyDocumentsSection({
  propertyId,
  documents,
}: {
  propertyId: string;
  documents: ComponentProps<typeof MediaManager>['documents'];
}) {
  const { isEs } = useTranslation();

  return (
    <div>
      <h2 className="text-lg tracking-tight">{isEs ? 'Documentos' : 'Documents'}</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {isEs
          ? 'Planos, dossiers y otros archivos descargables mostrados en la ficha del inmueble. Las fotos se gestionan arriba, en "Fotografías y Galería".'
          : 'Floor plans, brochures and other downloadable files shown on the listing page. Photos are managed above under "Photos and Gallery".'}
      </p>
      <div className="mt-4">
        <MediaManager propertyId={propertyId} documents={documents} />
      </div>
    </div>
  );
}

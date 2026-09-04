'use client';

import { useTranslation } from '@/i18n/context';
import { PropertyForm } from '../property-form';

interface Option {
  id: string;
  name: string;
}

export function NewPropertyView({ agentOptions }: { agentOptions?: Option[] }) {
  const { isEs } = useTranslation();

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl text-headline">{isEs ? 'Nueva propiedad' : 'New property'}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isEs
            ? 'Publica un nuevo inmueble en el catálogo con sus datos, fotografías y especificaciones.'
            : 'Publish a new listing in the catalogue with its details, photos and specifications.'}
        </p>
      </div>
      <PropertyForm agentOptions={agentOptions} />
    </div>
  );
}

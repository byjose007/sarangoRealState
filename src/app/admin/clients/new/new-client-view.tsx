'use client';

import { useTranslation } from '@/i18n/context';
import { ClientForm } from '../client-form';

export function NewClientView() {
  const { isEs } = useTranslation();

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl text-headline">{isEs ? 'Nuevo cliente' : 'New client'}</h1>
      <ClientForm />
    </div>
  );
}

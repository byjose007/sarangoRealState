'use client';

import { ConfirmActionButton } from '@/components/admin/confirm-button';
import { deletePropertyAction } from '@/actions/properties';
import { useTranslation } from '@/i18n/context';

export function DeletePropertyButton({ id, title }: { id: string; title: string }) {
  const { isEs } = useTranslation();
  return (
    <ConfirmActionButton
      label={isEs ? 'Eliminar' : 'Delete'}
      confirmTitle={isEs ? `¿Eliminar "${title}"?` : `Delete "${title}"?`}
      confirmDescription={
        isEs
          ? 'Esta acción ocultará la propiedad del catálogo. No se puede deshacer desde aquí.'
          : "This hides it from the site. It can't be undone from here."
      }
      onConfirm={() => deletePropertyAction(id)}
    />
  );
}

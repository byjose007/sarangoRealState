'use client';

import { ConfirmActionButton } from '@/components/admin/confirm-button';
import { deleteAgentAction } from '@/actions/agents';
import { useTranslation } from '@/i18n/context';

export function DeleteAgentButton({ id, name }: { id: string; name: string }) {
  const { isEs } = useTranslation();
  return (
    <ConfirmActionButton
      label={isEs ? 'Eliminar' : 'Delete'}
      confirmTitle={isEs ? `¿Eliminar a ${name}?` : `Delete ${name}?`}
      confirmDescription={
        isEs
          ? 'Esta acción desactivará su acceso y lo ocultará del sitio web.'
          : "This deactivates their login and hides them from the site. It can't be undone from here."
      }
      onConfirm={() => deleteAgentAction(id)}
    />
  );
}

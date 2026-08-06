'use client';

import { ConfirmActionButton } from '@/components/admin/confirm-button';
import { deletePropertyAction } from '@/actions/properties';

export function DeletePropertyButton({ id, title }: { id: string; title: string }) {
  return (
    <ConfirmActionButton
      label="Delete"
      confirmTitle={`Delete "${title}"?`}
      confirmDescription="This hides it from the site. It can't be undone from here."
      onConfirm={() => deletePropertyAction(id)}
    />
  );
}

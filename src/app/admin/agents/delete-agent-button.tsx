'use client';

import { ConfirmActionButton } from '@/components/admin/confirm-button';
import { deleteAgentAction } from '@/actions/agents';

export function DeleteAgentButton({ id, name }: { id: string; name: string }) {
  return (
    <ConfirmActionButton
      label="Delete"
      confirmTitle={`Delete ${name}?`}
      confirmDescription="This deactivates their login and hides them from the site. It can't be undone from here."
      onConfirm={() => deleteAgentAction(id)}
    />
  );
}

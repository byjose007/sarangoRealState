'use client';

import { useState, useTransition } from 'react';
import { useTranslation } from '@/i18n/context';
import { Modal } from '@/components/ui/modal';
import { Button, type ButtonProps } from '@/components/ui/button';

interface ConfirmActionButtonProps {
  label: string;
  confirmTitle: string;
  confirmDescription?: string;
  onConfirm: () => Promise<{ ok: boolean; message: string }>;
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
}

export function ConfirmActionButton({
  label,
  confirmTitle,
  confirmDescription,
  onConfirm,
  variant = 'outline',
  size = 'sm',
}: ConfirmActionButtonProps) {
  const { isEs } = useTranslation();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <Button type="button" variant={variant} size={size} onClick={() => setOpen(true)}>
        {label}
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={confirmTitle}
        description={confirmDescription}
      >
        {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>
            {isEs ? 'Cancelar' : 'Cancel'}
          </Button>
          <Button
            type="button"
            variant="ink"
            disabled={pending}
            onClick={() => {
              setError(null);
              startTransition(async () => {
                const result = await onConfirm();
                if (!result.ok) {
                  setError(result.message);
                  return;
                }
                setOpen(false);
              });
            }}
          >
            {pending ? (isEs ? 'Procesando…' : 'Working…') : isEs ? 'Confirmar' : 'Confirm'}
          </Button>
        </div>
      </Modal>
    </>
  );
}

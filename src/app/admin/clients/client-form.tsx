'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createClientAction, updateClientAction } from '@/actions/clients';
import { Input, Textarea } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/admin/field';
import { useTranslation } from '@/i18n/context';

export interface ClientFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes: string;
}

const EMPTY: ClientFormValues = { firstName: '', lastName: '', email: '', phone: '', notes: '' };

interface ClientFormProps {
  clientId?: string;
  initialValues?: Partial<ClientFormValues>;
}

export function ClientForm({ clientId, initialValues }: ClientFormProps) {
  const router = useRouter();
  const { isEs } = useTranslation();
  const [values, setValues] = useState<ClientFormValues>({ ...EMPTY, ...initialValues });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const isEdit = Boolean(clientId);

  function set<K extends keyof ClientFormValues>(key: K, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});

    startTransition(async () => {
      const payload = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone || undefined,
        notes: values.notes || undefined,
      };
      const result = isEdit
        ? await updateClientAction(clientId!, payload)
        : await createClientAction(payload);

      if (!result.ok) {
        setFormError(result.message);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }

      toast.success(result.message);
      if (isEdit) {
        router.refresh();
      } else {
        router.push(`/admin/clients/${result.data!.id}`);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {formError ? <p className="text-sm text-destructive">{formError}</p> : null}

      <section className="grid gap-5 sm:grid-cols-2">
        <Field label={isEs ? 'Nombre' : 'First name'} error={fieldErrors.firstName}>
          <Input
            value={values.firstName}
            onChange={(e) => set('firstName', e.target.value)}
            required
          />
        </Field>
        <Field label={isEs ? 'Apellido' : 'Last name'} error={fieldErrors.lastName}>
          <Input
            value={values.lastName}
            onChange={(e) => set('lastName', e.target.value)}
            required
          />
        </Field>
        <Field label={isEs ? 'Correo electrónico' : 'Email'} error={fieldErrors.email}>
          <Input
            type="email"
            value={values.email}
            onChange={(e) => set('email', e.target.value)}
            required
          />
        </Field>
        <Field label={isEs ? 'Teléfono (opcional)' : 'Phone (optional)'}>
          <Input value={values.phone} onChange={(e) => set('phone', e.target.value)} />
        </Field>
      </section>

      <Field label={isEs ? 'Notas internas (opcional)' : 'Notes (optional)'}>
        <Textarea rows={4} value={values.notes} onChange={(e) => set('notes', e.target.value)} />
      </Field>

      <Button type="submit" disabled={pending}>
        {pending
          ? isEs
            ? 'Guardando…'
            : 'Saving…'
          : isEdit
            ? isEs
              ? 'Guardar cambios'
              : 'Save changes'
            : isEs
              ? 'Crear cliente'
              : 'Create client'}
      </Button>
    </form>
  );
}

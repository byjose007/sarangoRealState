'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from '@/i18n/context';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function Newsletter({ compact = false }: { compact?: boolean }) {
  const { t, isEs } = useTranslation();
  const [email, setEmail] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  const schema = React.useMemo(
    () => z.string().email(isEs ? 'Introduce un correo válido' : 'Enter a valid email address'),
    [isEs],
  );

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const result = schema.safeParse(email);
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? (isEs ? 'Correo no válido' : 'Enter a valid email address'));
      return;
    }
    setError(null);
    setPending(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    setPending(false);
    setEmail('');
    toast.success(isEs ? '¡Suscripción confirmada!' : 'Subscribed', {
      description: isEs
        ? 'Recibirás el próximo informe mensual de mercado en tu bandeja de entrada.'
        : 'The next market note lands in your inbox on the first Tuesday.',
    });
  };

  return (
    <form onSubmit={submit} className="w-full">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={t.common.newsletterPlaceholder}
          aria-label={t.common.newsletterPlaceholder}
          className={compact ? 'sm:h-11' : 'sm:h-12'}
        />
        <Button type="submit" disabled={pending} size={compact ? 'md' : 'lg'}>
          {pending ? (isEs ? 'Enviando…' : 'Subscribing…') : t.common.subscribe} <ArrowRight className="size-4" />
        </Button>
      </div>
      {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}
    </form>
  );
}

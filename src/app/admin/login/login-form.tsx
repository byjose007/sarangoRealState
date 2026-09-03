'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Input, Label, FieldError } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/i18n/context';
import { loginAction, type LoginState } from './actions';

function SubmitButton({ isEs }: { isEs: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (isEs ? 'Entrando…' : 'Signing in…') : isEs ? 'Entrar' : 'Sign in'}
    </Button>
  );
}

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [state, formAction] = useActionState<LoginState, FormData>(loginAction, {});
  const { isEs } = useTranslation();

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <div>
        <Label htmlFor="email">{isEs ? 'Correo electrónico' : 'Email'}</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          placeholder="admin@sarangorealestate.com"
          required
        />
      </div>
      <div>
        <Label htmlFor="password">{isEs ? 'Contraseña' : 'Password'}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      <FieldError message={state.error} />
      <SubmitButton isEs={isEs} />
    </form>
  );
}

'use client';

import { useTranslation } from '@/i18n/context';
import { LanguageToggle } from '@/components/layout/language-toggle';

export function LoginHeader() {
  const { isEs } = useTranslation();
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl text-headline font-semibold">Sarango Real Estate Admin</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isEs ? 'Acceso para agentes y administradores.' : 'Agent and administrator sign-in.'}
        </p>
      </div>
      <LanguageToggle className="shrink-0" />
    </div>
  );
}

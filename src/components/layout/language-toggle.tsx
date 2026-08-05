'use client';

import * as React from 'react';
import { useLanguage } from '@/i18n/context';
import { cn } from '@/lib/utils';
import { Globe } from 'lucide-react';

interface LanguageToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function LanguageToggle({ className, showLabel = false }: LanguageToggleProps) {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'es' ? 'en' : 'es');
  };

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      aria-label={`Cambiar idioma / Change language (Actual: ${language.toUpperCase()})`}
      title={language === 'es' ? 'Cambiar a English' : 'Switch to Español'}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-mono tracking-wider transition-all duration-300 hover:border-brass hover:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brass',
        className,
      )}
    >
      <Globe className="size-3.5 text-brass" />
      <span className="font-semibold uppercase tracking-widest">{language.toUpperCase()}</span>
      {showLabel && (
        <span className="text-muted-foreground">
          ({language === 'es' ? 'Español' : 'English'})
        </span>
      )}
    </button>
  );
}

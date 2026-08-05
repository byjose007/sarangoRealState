'use client';

import { Breadcrumb } from '@/components/layout/breadcrumb';
import { useTranslation } from '@/i18n/context';

export function PropertiesPageHeader({ total }: { total: number }) {
  const { t, isEs } = useTranslation();

  return (
    <header className="border-b border-border bg-surface">
      <div className="container py-12 lg:py-16">
        <Breadcrumb items={[{ label: t.property.allProperties }]} />
        <h1 className="mt-6 text-headline balance">{t.explorer.title}</h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          {isEs
            ? `${total} propiedades en diez ciudades. Cada una medida y auditada antes de su publicación: planos, consumos y dossier completo.`
            : `${total} homes across ten cities. Every one measured before it was published — the plan, the readings and the document pack are on each record.`}
        </p>
      </div>
    </header>
  );
}

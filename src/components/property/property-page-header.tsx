'use client';

import { Breadcrumb } from '@/components/layout/breadcrumb';
import { useTranslation } from '@/i18n/context';

export function PropertiesPageHeader({ total }: { total: number }) {
  const { t, isEs } = useTranslation();

  return (
    <header className="border-b border-border bg-surface">
      <div className="container py-12 lg:py-16">
        <Breadcrumb items={[{ label: t.property.allProperties }]} />
        <h1 className="balance mt-6 text-headline">{t.explorer.title}</h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          {isEs
            ? `${total} propiedades disponibles en Cuenca, Azuay. Cada una medida y auditada antes de su publicación: planos, consumos y dossier completo.`
            : `${total} properties available in Cuenca, Azuay. Every one measured before publication: floor plans, utility readings, and full document pack.`}
        </p>
      </div>
    </header>
  );
}

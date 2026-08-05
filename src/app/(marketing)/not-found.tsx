'use client';

import Link from 'next/link';
import { useTranslation } from '@/i18n/context';
import { buttonVariants } from '@/components/ui/button';

export default function NotFound() {
  const { t, isEs } = useTranslation();

  return (
    <div className="container flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
      <p className="font-display text-[clamp(6rem,18vw,12rem)] leading-none tracking-[-0.04em] text-primary">
        404
      </p>
      <span className="eyebrow mt-4">{isEs ? 'Sin registro en esta dirección' : 'No record at this address'}</span>
      <h1 className="mt-5 max-w-xl text-headline balance">
        {isEs
          ? 'Hemos auditado todo el sitio y esta página no aparece en los planos'
          : 'We measured the whole site and this page is not on the plan'}
      </h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        {isEs
          ? 'Es posible que la propiedad haya sido vendida o la dirección tenga un error tipográfico.'
          : 'The listing may have closed, or the link picked up a typo. The catalogue is one click away.'}
      </p>
      <div className="mt-9 flex flex-wrap justify-center gap-3">
        <Link href="/properties" className={buttonVariants({ size: 'lg' })}>
          {t.favorites.browseCatalogue}
        </Link>
        <Link href="/contact" className={buttonVariants({ size: 'lg', variant: 'outline' })}>
          {t.nav.contact}
        </Link>
      </div>
    </div>
  );
}

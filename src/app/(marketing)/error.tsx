'use client';

import { useEffect } from 'react';
import { RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <span className="eyebrow">Something broke</span>
      <h1 className="mt-5 text-headline">This page did not load</h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        The listing data could not be read. Try again — if it keeps happening, the desk can send you
        the record directly.
      </p>
      {error.digest ? (
        <p className="mt-3 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">
          Ref {error.digest}
        </p>
      ) : null}
      <Button className="mt-8" onClick={reset}>
        <RefreshCcw className="size-4" /> Try again
      </Button>
    </div>
  );
}

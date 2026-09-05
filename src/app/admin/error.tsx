'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

// Without this boundary, any error thrown while rendering an /admin page — or
// thrown out of a Server Action called from one (an expired session bounced to
// /admin/login by proxy.ts, a rotated action id after a deploy, an unhandled
// Prisma error) — bubbles past the layout and the user just gets a blank page.
// This keeps them on a readable screen and shows what actually broke.
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[admin] unhandled error', error);
  }, [error]);

  const router = useRouter();
  const looksLikeAuth = /fetch|Server Action|redirect|Unexpected token/i.test(error.message);

  return (
    <div className="mx-auto flex max-w-lg flex-col items-start gap-4 py-16">
      <h1 className="font-display text-xl tracking-tight text-foreground">
        Algo salió mal en el panel
      </h1>
      <p className="text-sm text-muted-foreground">
        {looksLikeAuth
          ? 'La acción no se pudo completar. Es posible que tu sesión haya expirado. Vuelve a iniciar sesión e inténtalo de nuevo.'
          : 'Ocurrió un error inesperado al procesar tu solicitud. Los cambios podrían no haberse guardado.'}
      </p>
      <pre className="w-full overflow-x-auto rounded-lg border border-border bg-muted/40 p-3 font-mono text-xs text-muted-foreground">
        {error.message || 'Error desconocido'}
        {error.digest ? `\n\ndigest: ${error.digest}` : ''}
      </pre>
      <div className="flex flex-wrap gap-3">
        <Button type="button" size="sm" onClick={reset}>
          Reintentar
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            router.push('/admin/login');
            router.refresh();
          }}
        >
          Ir a iniciar sesión
        </Button>
      </div>
    </div>
  );
}

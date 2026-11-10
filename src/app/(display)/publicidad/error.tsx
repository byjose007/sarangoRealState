'use client';

import * as React from 'react';

export default function PublicidadError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    if (typeof console !== 'undefined' && console.error) {
      console.error('[PublicidadError]', error);
    }
    try {
      const win = window as unknown as { __startLegacyTvSlideshow?: () => boolean };
      if (typeof win.__startLegacyTvSlideshow === 'function') {
        win.__startLegacyTvSlideshow();
      }
    } catch {
      // ignore
    }
  }, [error]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        backgroundColor: '#0A0F0D',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px',
        textAlign: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <p
        style={{
          fontSize: '28px',
          lineHeight: 1.4,
          maxWidth: '760px',
          margin: 0,
          fontWeight: 600,
        }}
      >
        Navegador de TV no compatible. Por favor, visita{' '}
        <a
          href="https://sarangorealestate.com/publicidad"
          style={{ color: '#CE9E51', textDecoration: 'underline' }}
        >
          sarangorealestate.com/publicidad
        </a>{' '}
        desde tu móvil
      </p>
    </div>
  );
}

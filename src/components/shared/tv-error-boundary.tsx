'use client';

import * as React from 'react';

interface TvErrorBoundaryProps {
  children: React.ReactNode;
}

interface TvErrorBoundaryState {
  hasError: boolean;
}

/**
 * Global / Display ErrorBoundary designed for legacy Smart TV browsers
 * (older LG webOS, Samsung Tizen, Android TV WebViews). Uses inline styles
 * as a rock-solid fallback in case modern CSS features also fail to parse.
 */
export class TvErrorBoundary extends React.Component<TvErrorBoundaryProps, TvErrorBoundaryState> {
  constructor(props: TvErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): TvErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    if (typeof console !== 'undefined' && console.error) {
      console.error('[TvErrorBoundary] Render error on display:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
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

    return this.props.children;
  }
}

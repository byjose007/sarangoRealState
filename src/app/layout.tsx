import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProviders } from '@/providers/app-providers';
import { siteConfig } from '@/constants/site';
import { organizationJsonLd } from '@/lib/seo';

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: ['real estate', 'homes for sale', 'property listings', 'apartments', 'agents'],
  authors: [{ name: siteConfig.name }],
  openGraph: {
    type: 'website',
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/images/logo-sarango-real.jpeg', type: 'image/jpeg' },
    ],
    shortcut: ['/images/logo-sarango-real.jpeg'],
    apple: [{ url: '/images/logo-sarango-real.jpeg', type: 'image/jpeg' }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F6F5F2' },
    { media: '(prefers-color-scheme: dark)', color: '#0A0F0D' },
  ],
};

const SMART_TV_POLYFILL_SCRIPT = `
(function() {
  try {
    if (typeof globalThis === 'undefined') {
      window.globalThis = window;
    }
    if (!Object.hasOwn) {
      Object.hasOwn = function(obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
      };
    }
    if (!String.prototype.replaceAll) {
      String.prototype.replaceAll = function(search, replacement) {
        return this.split(search).join(replacement);
      };
    }
    if (!Array.prototype.at) {
      Array.prototype.at = function(n) {
        n = Math.trunc(n) || 0;
        if (n < 0) n += this.length;
        return (n < 0 || n >= this.length) ? undefined : this[n];
      };
    }
    if (!String.prototype.at) {
      String.prototype.at = function(n) {
        n = Math.trunc(n) || 0;
        if (n < 0) n += this.length;
        return (n < 0 || n >= this.length) ? undefined : this.charAt(n);
      };
    }
    if (typeof queueMicrotask === 'undefined') {
      window.queueMicrotask = function(cb) {
        Promise.resolve().then(cb);
      };
    }
    if (!Promise.allSettled) {
      Promise.allSettled = function(promises) {
        return Promise.all(Array.prototype.map.call(promises, function(p) {
          return Promise.resolve(p).then(
            function(value) { return { status: 'fulfilled', value: value }; },
            function(reason) { return { status: 'rejected', reason: reason }; }
          );
        }));
      };
    }
    if (typeof ResizeObserver === 'undefined') {
      window.ResizeObserver = function() {
        return { observe: function(){}, unobserve: function(){}, disconnect: function(){} };
      };
    }

    var bootFailed = false;
    function showTvFallback() {
      if (bootFailed) return;
      var root = document.querySelector('[data-tv-slideshow-mounted="1"]');
      if (root) return;
      bootFailed = true;
      var el = document.createElement('div');
      el.setAttribute('style', 'position:fixed;top:0;right:0;bottom:0;left:0;z-index:99999;background:#0A0F0D;color:#FFFFFF;display:flex;align-items:center;justify-content:center;padding:32px;text-align:center;font-family:system-ui,-apple-system,sans-serif;');
      el.innerHTML = '<p style="font-size:28px;line-height:1.4;max-width:760px;margin:0;font-weight:600;">Navegador de TV no compatible. Por favor, visita <a href="https://sarangorealestate.com/publicidad" style="color:#CE9E51;text-decoration:underline;">sarangorealestate.com/publicidad</a> desde tu móvil</p>';
      if (document.body) {
        document.body.appendChild(el);
      }
    }

    window.addEventListener('error', function(e) {
      if (window.location && window.location.pathname.indexOf('/publicidad') !== -1) {
        setTimeout(showTvFallback, 2500);
      }
    });
  } catch (err) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <script dangerouslySetInnerHTML={{ __html: SMART_TV_POLYFILL_SCRIPT }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Manrope:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
        />
      </head>
      <body suppressHydrationWarning>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

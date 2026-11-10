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
    if (!Object.fromEntries) {
      Object.fromEntries = function(entries) {
        var obj = {};
        if (!entries) return obj;
        var arr = Array.from ? Array.from(entries) : entries;
        for (var i = 0; i < arr.length; i++) {
          var pair = arr[i];
          if (pair && pair.length >= 2) obj[pair[0]] = pair[1];
        }
        return obj;
      };
    }
    if (!String.prototype.replaceAll) {
      String.prototype.replaceAll = function(search, replacement) {
        return this.split(search).join(replacement);
      };
    }
    if (!Array.prototype.at) {
      Array.prototype.at = function(n) {
        n = Math.trunc ? Math.trunc(n) : parseInt(n, 10) || 0;
        if (n < 0) n += this.length;
        return (n < 0 || n >= this.length) ? undefined : this[n];
      };
    }
    if (!Array.prototype.flat) {
      Array.prototype.flat = function(depth) {
        var d = depth === undefined ? 1 : Number(depth);
        var result = [];
        (function flatten(arr, currDepth) {
          for (var i = 0; i < arr.length; i++) {
            if (Array.isArray(arr[i]) && currDepth > 0) {
              flatten(arr[i], currDepth - 1);
            } else {
              result.push(arr[i]);
            }
          }
        })(this, d);
        return result;
      };
    }
    if (!Array.prototype.flatMap) {
      Array.prototype.flatMap = function(cb, thisArg) {
        return this.map(cb, thisArg).flat(1);
      };
    }
    if (!String.prototype.at) {
      String.prototype.at = function(n) {
        n = Math.trunc ? Math.trunc(n) : parseInt(n, 10) || 0;
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
    if (typeof IntersectionObserver === 'undefined') {
      window.IntersectionObserver = function() {
        return { observe: function(){}, unobserve: function(){}, disconnect: function(){}, takeRecords: function(){ return []; } };
      };
    }
    var origMatchMedia = window.matchMedia;
    window.matchMedia = function(query) {
      var mql = origMatchMedia ? origMatchMedia.call(window, query) : null;
      if (!mql) {
        mql = {
          matches: false,
          media: query || '',
          onchange: null,
          addListener: function() {},
          removeListener: function() {},
          addEventListener: function() {},
          removeEventListener: function() {},
          dispatchEvent: function() { return false; }
        };
      } else {
        if (!mql.addEventListener) {
          mql.addEventListener = function(type, listener) {
            if (type === 'change' && mql.addListener) mql.addListener(listener);
          };
        }
        if (!mql.removeEventListener) {
          mql.removeEventListener = function(type, listener) {
            if (type === 'change' && mql.removeListener) mql.removeListener(listener);
          };
        }
        if (!mql.addListener) {
          mql.addListener = function(listener) {
            if (mql.addEventListener) mql.addEventListener('change', listener);
          };
        }
        if (!mql.removeListener) {
          mql.removeListener = function(listener) {
            if (mql.removeEventListener) mql.removeEventListener('change', listener);
          };
        }
      }
      return mql;
    };

    var bootFailed = false;
    function showTvFallback() {
      if (bootFailed) return;
      if (window.__TV_REACT_HYDRATED__ || window.__TV_LEGACY_ACTIVE__) return;
      if (typeof window.__startLegacyTvSlideshow === 'function') {
        if (window.__startLegacyTvSlideshow()) return;
      }
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

    window.addEventListener('error', function() {
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

// Everything this app actually loads cross-origin: Google Fonts (layout.tsx),
// CartoDB map tiles + Mapbox static images (open-street-map.tsx /
// property-map.tsx), demo/listing photography (next.config images below),
// and the video/embed iframes (property-video.tsx, Google Maps embed).
// Keep this list in sync if a new external host gets added anywhere.
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "img-src 'self' data: blob: https://images.unsplash.com https://picsum.photos https://i.pravatar.cc https://*.basemaps.cartocdn.com https://api.mapbox.com",
  "font-src 'self' https://fonts.gstatic.com",
  // Next.js injects inline <style>/<script> for hydration and styled JSX;
  // a nonce-based policy is a stronger follow-up but needs per-request
  // wiring in proxy.ts — 'unsafe-inline' is the safe baseline for now.
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  // React dev mode reconstructs component stacks via eval() (never used in
  // production — see https://react.dev) — allow it only outside prod so
  // `next dev` doesn't trip the policy on every page.
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === 'production' ? '' : " 'unsafe-eval'"}`,
  "connect-src 'self'",
  "frame-src https://www.google.com https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  // Ignored by browsers over plain HTTP — harmless until TLS is live, and
  // then already in place. See nginx/nginx.conf for the HTTPS side.
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: 'standalone',
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'i.pravatar.cc' },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'react-icons', 'framer-motion'],
    // Image uploads go through a Server Action (see src/actions/uploadImage.ts).
    // The default Server Action body limit is 1MB, which rejects normal camera
    // photos before our own 10MB check in src/lib/uploads.ts can run. Keep this
    // a little above MAX_IMAGE_BYTES to leave room for multipart overhead.
    serverActions: {
      bodySizeLimit: '12mb',
    },
  },
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
};

export default nextConfig;

'use client';

import * as React from 'react';
import Image, { type ImageProps } from 'next/image';
import { cn } from '@/lib/utils';

const BRAND_FALLBACK_IMAGE = '/images/logo-sarango-real.jpeg';

type SmartImageProps = Omit<ImageProps, 'src'> & { src: string; fallbackSeed?: string };

function isDirectUploadUrl(url: string): boolean {
  return (
    url.startsWith('/uploads/') ||
    url.startsWith('data:') ||
    url.startsWith('blob:') ||
    (Boolean(process.env.NEXT_PUBLIC_UPLOADS_BASE_URL) &&
      url.startsWith(process.env.NEXT_PUBLIC_UPLOADS_BASE_URL!))
  );
}

/**
 * next/image wrapper that serves user-uploaded files (/uploads/*) directly
 * without routing through /_next/image re-encoding, and falls back to the
 * brand logo instead of external development placeholders (picsum.photos) if
 * an asset ever fails to load.
 */
export function SmartImage({
  src,
  alt,
  className,
  fallbackSeed: _fallbackSeed,
  unoptimized,
  onError,
  ...props
}: SmartImageProps) {
  const [failedSrc, setFailedSrc] = React.useState<string | null>(null);
  const isFallback = !src || failedSrc === src;
  const current = isFallback ? BRAND_FALLBACK_IMAGE : src;

  return (
    <Image
      {...props}
      src={current}
      alt={alt}
      unoptimized={unoptimized ?? (isDirectUploadUrl(current) || isFallback)}
      className={cn(isFallback ? 'bg-[#0A0F0D] object-contain p-6' : 'object-cover', className)}
      onError={(event) => {
        if (!isFallback) {
          setFailedSrc(src);
        }
        onError?.(event);
      }}
    />
  );
}

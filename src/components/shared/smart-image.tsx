'use client';

import * as React from 'react';
import Image, { type ImageProps } from 'next/image';
import { placeholder } from '@/data/images';
import { cn } from '@/lib/utils';

type SmartImageProps = Omit<ImageProps, 'src'> & { src: string; fallbackSeed?: string };

/**
 * next/image wrapper with a deterministic fallback. Remote demo assets can
 * disappear; the layout should not.
 */
export function SmartImage({ src, alt, className, fallbackSeed, ...props }: SmartImageProps) {
  const [current, setCurrent] = React.useState(src);
  React.useEffect(() => setCurrent(src), [src]);

  return (
    <Image
      {...props}
      src={current}
      alt={alt}
      className={cn('object-cover', className)}
      onError={() => setCurrent(placeholder(fallbackSeed ?? String(alt) ?? 'vestra'))}
    />
  );
}

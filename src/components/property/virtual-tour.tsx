'use client';

import * as React from 'react';
import { Compass, RotateCw } from 'lucide-react';
import { SmartImage } from '@/components/shared/smart-image';

/**
 * 360° room preview. Drag (or use the slider) to pan across the panorama —
 * plug a real tour URL into `tourUrl` to swap in Matterport or Kuula.
 */
export function VirtualTour({ image, title }: { image: string; title: string }) {
  const [angle, setAngle] = React.useState(0);
  const dragging = React.useRef(false);
  const last = React.useRef(0);

  const onDown = (clientX: number) => {
    dragging.current = true;
    last.current = clientX;
  };
  const onMove = (clientX: number) => {
    if (!dragging.current) return;
    const delta = clientX - last.current;
    last.current = clientX;
    setAngle((value) => Math.max(-60, Math.min(60, value + delta * 0.12)));
  };
  const stop = () => {
    dragging.current = false;
  };

  return (
    <div
      className="relative aspect-[16/9] cursor-grab overflow-hidden rounded-lg border border-border active:cursor-grabbing"
      onMouseDown={(event) => onDown(event.clientX)}
      onMouseMove={(event) => onMove(event.clientX)}
      onMouseUp={stop}
      onMouseLeave={stop}
      onTouchStart={(event) => onDown(event.touches[0]?.clientX ?? 0)}
      onTouchMove={(event) => onMove(event.touches[0]?.clientX ?? 0)}
      onTouchEnd={stop}
    >
      <div
        className="absolute inset-0 scale-125 transition-transform duration-150 ease-out"
        style={{ transform: `scale(1.25) translateX(${angle * 0.4}%)` }}
      >
        <SmartImage src={image} alt={`${title} — 360 degree view`} fill sizes="100vw" fallbackSeed={`${title}-tour`} />
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between p-4">
        <span className="inline-flex items-center gap-2 rounded-full bg-background/90 px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-[0.14em]">
          <Compass className="size-3.5 text-brass" /> {Math.round(180 + angle * 3)}°
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-background/90 px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-[0.14em]">
          <RotateCw className="size-3.5 text-brass" /> Drag to look around
        </span>
      </div>
    </div>
  );
}

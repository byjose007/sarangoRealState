'use client';

import * as React from 'react';
import type { FloorPlan } from '@/types';
import { formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';

/** Plans are drawn as inline SVG — no image assets, sharp at any zoom. */
export function FloorPlans({ plans }: { plans: FloorPlan[] }) {
  const [active, setActive] = React.useState(0);
  const plan = plans[active];
  if (!plan) return null;

  return (
    <div className="grid gap-6 md:grid-cols-[14rem_1fr]">
      <div className="flex gap-2 md:flex-col">
        {plans.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActive(index)}
            className={cn(
              'flex-1 rounded-md border px-4 py-3 text-left transition-colors',
              index === active ? 'border-primary bg-primary-soft' : 'border-border hover:bg-muted',
            )}
          >
            <p className="font-display text-base">{item.name}</p>
            <p className="mt-1 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-muted-foreground">
              {formatNumber(item.area)} sq ft · {item.bedrooms} bd · {item.bathrooms} ba
            </p>
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-surface p-4">
        <svg viewBox="0 0 320 220" className="h-auto w-full" role="img" aria-label={`${plan.name} floor plan`}>
          <defs>
            <pattern id="plan-grid" width="16" height="16" patternUnits="userSpaceOnUse">
              <path d="M16 0H0v16" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="320" height="220" fill="url(#plan-grid)" />
          <polygon
            points={plan.outline}
            fill="hsl(var(--primary-soft))"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {plan.rooms.map((room) => (
            <g key={room.name}>
              <circle cx={room.x} cy={room.y} r="2" fill="hsl(var(--brass))" />
              <text
                x={room.x + 6}
                y={room.y + 4}
                fontSize="9"
                fontFamily="var(--font-mono)"
                fill="hsl(var(--muted-foreground))"
              >
                {room.name}
              </text>
            </g>
          ))}
          <line x1="20" y1="210" x2="300" y2="210" stroke="hsl(var(--brass))" strokeWidth="1" />
          <text x="150" y="206" fontSize="8" fontFamily="var(--font-mono)" fill="hsl(var(--brass))">
            {formatNumber(plan.area)} SQ FT
          </text>
        </svg>
      </div>
    </div>
  );
}

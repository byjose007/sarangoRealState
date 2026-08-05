import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full font-mono text-[0.65rem] uppercase tracking-[0.14em]',
  {
    variants: {
      variant: {
        solid: 'bg-foreground text-background',
        primary: 'bg-primary text-primary-foreground',
        soft: 'bg-primary-soft text-primary',
        outline: 'border border-border text-muted-foreground',
        brass: 'bg-brass text-brass-foreground',
        glass: 'glass text-foreground',
      },
      size: { sm: 'h-6 px-2.5', md: 'h-7 px-3' },
    },
    defaultVariants: { variant: 'soft', size: 'sm' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

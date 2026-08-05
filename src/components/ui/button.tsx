import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-all duration-300 ease-entrance disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-soft',
        ink: 'bg-foreground text-background hover:bg-foreground/88',
        outline: 'border border-border bg-transparent text-foreground hover:border-foreground/40 hover:bg-muted/60',
        ghost: 'text-foreground hover:bg-muted',
        brass: 'bg-brass text-brass-foreground hover:bg-brass/90',
        link: 'text-primary underline-offset-4 hover:underline rounded-none px-0',
      },
      size: {
        sm: 'h-9 px-4 text-[0.8rem]',
        md: 'h-11 px-6 text-sm',
        lg: 'h-13 px-8 text-[0.95rem]',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8 [&_svg]:size-3.5',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  ),
);
Button.displayName = 'Button';

export { buttonVariants };

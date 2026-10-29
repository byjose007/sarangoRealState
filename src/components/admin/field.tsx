'use client';

import * as React from 'react';
import { Label, FieldError } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface FieldProps {
  id?: string;
  label: string;
  error?: string;
  required?: boolean;
  optional?: boolean;
  hint?: string;
  className?: string;
  children: React.ReactElement<{
    id?: string;
    className?: string;
    'aria-invalid'?: boolean | 'true' | 'false';
    'aria-required'?: boolean | 'true' | 'false';
    required?: boolean;
  }>;
}

/** Wires the Label to its input via a generated id — ui/input's Label has no htmlFor by default. */
export function Field({
  id: explicitId,
  label,
  error,
  required,
  optional,
  hint,
  className,
  children,
}: FieldProps) {
  const generatedId = React.useId();
  const id = explicitId || generatedId;
  const hasError = Boolean(error);

  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="inline-flex items-center">
          <span>{label}</span>
          {required ? (
            <span
              className="ml-1 font-bold text-destructive"
              title="Campo obligatorio"
              aria-hidden="true"
            >
              *
            </span>
          ) : null}
          {optional ? (
            <span className="ml-1.5 text-[0.62rem] font-normal lowercase tracking-normal text-muted-foreground/60">
              (opcional)
            </span>
          ) : null}
        </Label>
      </div>

      {React.cloneElement(children, {
        id: children.props.id || id,
        'aria-invalid': hasError ? 'true' : undefined,
        'aria-required': required ? 'true' : undefined,
        className: cn(
          children.props.className,
          hasError &&
            'border-destructive focus:border-destructive ring-1 ring-destructive/20 focus-visible:ring-destructive/30',
        ),
      })}

      {hint && !error ? <p className="text-[0.7rem] text-muted-foreground">{hint}</p> : null}

      <FieldError message={error} />
    </div>
  );
}

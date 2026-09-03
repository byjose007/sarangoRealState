'use client';

import * as React from 'react';
import { Label, FieldError } from '@/components/ui/input';

interface FieldProps {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactElement<{ id?: string }>;
}

/** Wires the Label to its input via a generated id — ui/input's Label has no htmlFor by default. */
export function Field({ label, error, className, children }: FieldProps) {
  const id = React.useId();
  return (
    <div className={className}>
      <Label htmlFor={id}>{label}</Label>
      {React.cloneElement(children, { id })}
      <FieldError message={error} />
    </div>
  );
}

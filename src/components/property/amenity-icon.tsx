import * as Icons from 'lucide-react';
import type { LucideProps } from 'lucide-react';

/** Resolves the icon name stored on each amenity, with a safe default. */
export function AmenityIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = (Icons as unknown as Record<string, React.ComponentType<LucideProps>>)[name];
  const Fallback = Icons.Check;
  const Component = Icon ?? Fallback;
  return <Component {...props} />;
}

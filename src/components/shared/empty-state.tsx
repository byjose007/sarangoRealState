import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';

interface EmptyStateProps {
  title: string;
  body: string;
  actionLabel?: string;
  actionHref?: string;
  icon?: React.ReactNode;
}

export function EmptyState({ title, body, actionLabel, actionHref, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border px-6 py-20 text-center">
      {icon ? <div className="mb-5 text-brass">{icon}</div> : null}
      <h3 className="text-xl tracking-tight">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{body}</p>
      {actionLabel && actionHref ? (
        <Link href={actionHref} className={buttonVariants({ variant: 'outline', className: 'mt-6' })}>
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

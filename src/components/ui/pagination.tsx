'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (item) => item === 1 || item === totalPages || Math.abs(item - page) <= 1,
  );

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
        className="grid h-10 w-10 place-items-center rounded-full border border-border transition-colors hover:bg-muted disabled:opacity-40"
      >
        <ChevronLeft className="size-4" />
      </button>
      {pages.map((item, index) => (
        <span key={item} className="flex items-center gap-2">
          {index > 0 && item - (pages[index - 1] as number) > 1 ? (
            <span className="px-1 text-muted-foreground">…</span>
          ) : null}
          <button
            type="button"
            onClick={() => onChange(item)}
            aria-current={item === page ? 'page' : undefined}
            className={cn(
              'h-10 min-w-10 rounded-full px-3 font-mono text-xs transition-colors',
              item === page
                ? 'bg-foreground text-background'
                : 'border border-border hover:bg-muted',
            )}
          >
            {String(item).padStart(2, '0')}
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
        className="grid h-10 w-10 place-items-center rounded-full border border-border transition-colors hover:bg-muted disabled:opacity-40"
      >
        <ChevronRight className="size-4" />
      </button>
    </nav>
  );
}

'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  side?: 'left' | 'right' | 'bottom';
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const offscreen = {
  left: { x: '-100%' },
  right: { x: '100%' },
  bottom: { y: '100%' },
};

export function Drawer({ open, onClose, side = 'right', title, children, className }: DrawerProps) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[100]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-foreground/45 backdrop-blur-sm"
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={offscreen[side]}
            animate={{ x: 0, y: 0 }}
            exit={offscreen[side]}
            transition={{ type: 'spring', damping: 30, stiffness: 260 }}
            className={cn(
              'absolute flex flex-col bg-background shadow-lift',
              side === 'bottom'
                ? 'inset-x-0 bottom-0 max-h-[86vh] rounded-t-xl'
                : 'top-0 h-full w-[min(24rem,88vw)]',
              side === 'left' && 'left-0',
              side === 'right' && 'right-0',
              className,
            )}
          >
            <header className="flex items-center justify-between border-b border-border px-5 py-4">
              <span className="font-mono text-eyebrow uppercase text-muted-foreground">{title}</span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="grid h-9 w-9 place-items-center rounded-full hover:bg-muted"
              >
                <X className="size-4" />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto">{children}</div>
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

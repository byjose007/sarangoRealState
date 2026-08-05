'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import Image from 'next/image';

/** Brief brand hold on first paint. Skipped entirely for reduced-motion users. */
export function Preloader() {
  const [done, setDone] = React.useState(true);
  // Decided once during render (read-only, side-effect-free) so it stays
  // consistent across React Strict Mode's double-invoked mount effect.
  const shouldShowRef = React.useRef<boolean | null>(null);
  if (shouldShowRef.current === null) {
    shouldShowRef.current =
      typeof window !== 'undefined' &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
      !sessionStorage.getItem('vestra:seen');
  }

  React.useEffect(() => {
    if (!shouldShowRef.current) return;
    sessionStorage.setItem('vestra:seen', '1');
    setDone(false);
    const timer = setTimeout(() => setDone(true), 1100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {done ? null : (
        <motion.div
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[200] grid place-items-center bg-background"
        >
          <div className="flex flex-col items-center text-center px-4">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="relative h-44 w-44 sm:h-52 sm:w-52 overflow-hidden rounded-3xl bg-white p-3 shadow-2xl ring-1 ring-brass/40 mb-6 flex items-center justify-center"
            >
              <Image
                src="/images/logo-sarango-real.jpeg"
                alt="Sarango Real Estate"
                width={300}
                height={300}
                className="h-full w-full object-contain"
                priority
              />
            </motion.div>
            <div className="mx-auto mt-2 h-0.5 w-48 overflow-hidden rounded-full bg-border">
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '0%' }}
                transition={{ duration: 1, ease: 'easeInOut' }}
                className="h-full w-full bg-brass"
              />
            </div>
            <p className="mt-4 font-mono text-eyebrow uppercase tracking-[0.2em] text-muted-foreground">
              Bienes Raíces · Cuenca
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

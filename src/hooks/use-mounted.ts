'use client';

import { useEffect, useState } from 'react';

/** Guards against hydration mismatches for persisted (client-only) state. */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

'use client';

import { useEffect, useState } from 'react';

/** Scroll position + direction, used by the sticky header and back-to-top. */
export function useScroll(threshold = 24) {
  const [state, setState] = useState({ y: 0, scrolled: false, direction: 'up' as 'up' | 'down' });

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setState({
        y,
        scrolled: y > threshold,
        direction: y > last && y > 120 ? 'down' : 'up',
      });
      last = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return state;
}

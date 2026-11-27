'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { gsap } from '@/lib/gsap';
import Logo from '@/components/ui/Logo';
import styles from './PageTransition.module.css';

const TransitionContext = createContext({ navigate: () => {} });
const SAFETY_TIMEOUT = 4000;

/**
 * Route transitions on a deterministic GSAP timeline: a panel wipes up over the page,
 * the route changes underneath, then the panel wipes away. Browser Back/Forward are
 * untouched (no interception); reduced motion navigates instantly.
 */
export default function PageTransition({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const panel = useRef(null);
  const state = useRef({ busy: false, waiting: false, timer: 0 });

  const reveal = useCallback(() => {
    const current = state.current;
    window.clearTimeout(current.timer);
    current.waiting = false;
    gsap.to(panel.current, {
      clipPath: 'inset(0% 0% 100% 0%)',
      duration: 0.75,
      delay: 0.12,
      ease: 'expo.inOut',
      onComplete: () => {
        gsap.set(panel.current, { autoAlpha: 0 });
        current.busy = false;
      },
    });
  }, []);

  const navigate = useCallback(
    (href) => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced || state.current.busy || !panel.current) {
        router.push(href);
        return;
      }
      state.current.busy = true;
      router.prefetch(href);
      gsap.fromTo(
        panel.current,
        { autoAlpha: 1, clipPath: 'inset(100% 0% 0% 0%)' },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 0.6,
          ease: 'expo.inOut',
          onComplete: () => {
            state.current.waiting = true;
            router.push(href);
            // never leave the visitor behind a closed panel
            state.current.timer = window.setTimeout(reveal, SAFETY_TIMEOUT);
          },
        },
      );
    },
    [reveal, router],
  );

  useEffect(() => {
    if (state.current.waiting) reveal();
  }, [pathname, reveal]);

  useEffect(() => () => window.clearTimeout(state.current.timer), []);

  const value = useMemo(() => ({ navigate }), [navigate]);

  return (
    <TransitionContext.Provider value={value}>
      {children}
      <div ref={panel} className={styles.panel} aria-hidden="true">
        <Logo size={72} />
      </div>
    </TransitionContext.Provider>
  );
}

export function usePageTransition() {
  return useContext(TransitionContext);
}

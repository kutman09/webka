'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const ScrollContext = createContext({ scrollTo: () => {}, lenis: { current: null } });

function headerOffset() {
  const value = getComputedStyle(document.documentElement).getPropertyValue('--header-h-compact');
  return -(parseInt(value, 10) || 64);
}

/**
 * The only scroll engine on the site: Lenis driven by the GSAP ticker,
 * with ScrollTrigger updated on every Lenis scroll event.
 * Native scroll is used when the user prefers reduced motion.
 */
export function SmoothScrollProvider({ children }) {
  const lenisRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.classList.add('js');
    if (reducedMotion) return undefined;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false,
    });
    lenisRef.current = lenis;

    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reducedMotion]);

  // New route: start at the top, or at the hash target if one is present.
  useEffect(() => {
    const hash = window.location.hash;
    const target = hash ? document.querySelector(hash) : null;
    if (target) {
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        if (lenisRef.current)
          lenisRef.current.scrollTo(target, { immediate: true, offset: headerOffset() });
        else target.scrollIntoView();
      });
    } else {
      lenisRef.current?.scrollTo(0, { immediate: true });
    }
  }, [pathname]);

  const scrollTo = useCallback((target, { focus = true } = {}) => {
    const element = typeof target === 'string' ? document.querySelector(target) : target;
    if (target !== 0 && !element) return;
    const done = () => {
      if (focus && element) {
        if (!element.hasAttribute('tabindex')) element.setAttribute('tabindex', '-1');
        element.focus({ preventScroll: true });
      }
    };
    if (lenisRef.current) {
      lenisRef.current.scrollTo(element ?? 0, {
        offset: element ? headerOffset() : 0,
        onComplete: done,
      });
    } else {
      if (element) element.scrollIntoView({ block: 'start' });
      else window.scrollTo(0, 0);
      done();
    }
  }, []);

  const value = useMemo(() => ({ scrollTo, lenis: lenisRef }), [scrollTo]);

  return <ScrollContext.Provider value={value}>{children}</ScrollContext.Provider>;
}

export function useSmoothScroll() {
  return useContext(ScrollContext);
}

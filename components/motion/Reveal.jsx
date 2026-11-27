'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * Sequential reveal for blocks: every direct child with [data-reveal] fades & rises in.
 * The variant changes the motion so not everything on the page moves the same way.
 */
const VARIANTS = {
  rise: { y: 48, autoAlpha: 0 },
  fade: { autoAlpha: 0 },
  mask: { clipPath: 'inset(0% 0% 100% 0%)', autoAlpha: 1 },
  slide: { x: -40, autoAlpha: 0 },
};

export default function Reveal({
  as: Tag = 'div',
  children,
  variant = 'rise',
  stagger = 0.1,
  start = 'top 85%',
  className = '',
  ...rest
}) {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const items = ref.current?.querySelectorAll('[data-reveal]');
      if (!items?.length) return;
      if (reduced) {
        items.forEach((item) => item.classList.add('is-revealed'));
        return;
      }
      gsap.fromTo(items, VARIANTS[variant], {
        x: 0,
        y: 0,
        autoAlpha: 1,
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 1.1,
        stagger,
        ease: 'expo.out',
        scrollTrigger: { trigger: ref.current, start, once: true },
        clearProps: 'clipPath,transform',
        onStart: () => items.forEach((item) => item.classList.add('is-revealed')),
      });
    },
    { scope: ref, dependencies: [reduced] },
  );

  return (
    <Tag ref={ref} className={className} {...rest}>
      {children}
    </Tag>
  );
}

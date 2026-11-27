'use client';

import { useRef } from 'react';
import { gsap, ScrollTrigger, SplitText, useGSAP } from '@/lib/gsap';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useSceneValue } from '@/lib/sceneStore';

const TARGETS = {
  lines: { type: 'lines', pick: (s) => s.lines, stagger: 0.09 },
  words: { type: 'lines,words', pick: (s) => s.words, stagger: 0.035 },
  chars: { type: 'lines,words,chars', pick: (s) => s.chars, stagger: 0.022 },
};

/**
 * Kinetic text: splits into lines / words / chars inside line masks and slides them up.
 *  intro — waits for the preloader instead of a ScrollTrigger.
 * Re-splits automatically when the text (language) or the layout width changes.
 */
export default function TextReveal({
  as: Tag = 'div',
  children,
  type = 'lines',
  className = '',
  delay = 0,
  duration = 1.25,
  start = 'top 86%',
  intro = false,
  ...rest
}) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const introDone = useSceneValue('introDone');

  useGSAP(
    (_, contextSafe) => {
      const element = ref.current;
      if (!element || reduced) return undefined;
      if (intro && !introDone) {
        gsap.set(element, { autoAlpha: 0 });
        return undefined;
      }
      const config = TARGETS[type] ?? TARGETS.lines;
      let split = null;
      let played = false;

      // Splitting measures layout, so it is done lazily — only when the element
      // approaches the viewport — instead of for every heading at hydration time.
      const reveal = contextSafe(() => {
        if (split) return;
        gsap.set(element, { autoAlpha: 1 });
        split = SplitText.create(element, {
          type: config.type,
          // the readable copy lives in the sr-only twin below
          aria: 'hidden',
          mask: 'lines',
          linesClass: 'split-line',
          autoSplit: true,
          onSplit: (self) => {
            if (played) return undefined; // re-splits on resize must not replay
            played = true;
            return gsap.from(config.pick(self), {
              yPercent: 115,
              rotate: type === 'chars' ? 4 : 0,
              duration,
              delay,
              stagger: config.stagger,
              ease: 'expo.out',
            });
          },
        });
      });

      if (intro) {
        reveal();
      } else {
        gsap.set(element, { autoAlpha: 0 });
        ScrollTrigger.create({ trigger: element, start, once: true, onEnter: reveal });
      }
      return () => split?.revert();
    },
    { dependencies: [children, introDone, reduced, type], scope: ref, revertOnUpdate: true },
  );

  // SplitText rewrites this element's DOM. Keying by the text makes React mount a
  // fresh element when the text (e.g. the language) changes, instead of patching
  // nodes SplitText has replaced.
  // Screen readers get the plain text once; the animated copy is aria-hidden.
  return (
    <Tag key={typeof children === 'string' ? children : undefined} className={className} {...rest}>
      <span className="sr-only">{children}</span>
      <span ref={ref} className="reveal-visual" aria-hidden="true">
        {children}
      </span>
    </Tag>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { useFinePointer, useReducedMotion } from '@/hooks/useReducedMotion';
import styles from './CustomCursor.module.css';

const LABELS = { view: 'View', drag: 'Drag' };

/**
 * Minimal follower ring next to the system cursor (which stays visible).
 * States come from the nearest [data-cursor] element: link | view | drag.
 * Only on fine pointers without reduced motion.
 */
export default function CustomCursor() {
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const enabled = fine && !reduced;
  const [state, setState] = useState('default');
  const [visible, setVisible] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springX = useSpring(x, { stiffness: 500, damping: 40, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 500, damping: 40, mass: 0.4 });

  useEffect(() => {
    if (!enabled) return undefined;
    const onMove = (event) => {
      x.set(event.clientX);
      y.set(event.clientY);
      setVisible(true);
      const target = event.target instanceof Element ? event.target.closest('[data-cursor]') : null;
      setState(target?.getAttribute('data-cursor') ?? 'default');
    };
    const onLeave = () => setVisible(false);
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      className={styles.cursor}
      data-state={state}
      data-visible={visible}
      style={{ x: springX, y: springY }}
      aria-hidden="true"
    >
      <span className={styles.ring}>
        {LABELS[state] && <span className={styles.label}>{LABELS[state]}</span>}
      </span>
    </motion.div>
  );
}

'use client';

import { motion, useScroll, useSpring } from 'motion/react';
import styles from './ScrollProgress.module.css';

/** Thin page progress bar under the header. */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 160, damping: 30, restDelta: 0.001 });
  return <motion.div className={styles.bar} style={{ scaleX }} aria-hidden="true" />;
}

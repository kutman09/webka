'use client';

import { useEffect, useRef, useState } from 'react';
import NeuralLab from './NeuralLab';
import ParticleLab from './ParticleLab';
import Terminal from '@/components/ui/Terminal';
import { useI18n } from '@/providers/LanguageProvider';
import styles from './LabExperiments.module.css';

/** Tracks whether an element is on screen, so experiments can pause their loops. */
export function useInView(ref, rootMargin = '0px') {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin,
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, rootMargin]);
  return inView;
}

function Experiment({ index, title, description, className = '', children }) {
  return (
    <article className={`${styles.card} ${className}`}>
      <header className={styles.cardHead}>
        <span className={styles.index}>{index}</span>
        <div>
          <h3 className={styles.cardTitle}>{title}</h3>
          <p className={styles.cardDesc}>{description}</p>
        </div>
      </header>
      {children}
    </article>
  );
}

export default function LabExperiments() {
  const { t } = useI18n();
  const neuralRef = useRef(null);
  const particlesRef = useRef(null);
  const neuralVisible = useInView(neuralRef);
  const particlesVisible = useInView(particlesRef);

  return (
    <div className={styles.grid}>
      <div ref={neuralRef} className={styles.neural}>
        <Experiment index="A" title={t('lab.neural.title')} description={t('lab.neural.desc')}>
          <NeuralLab active={neuralVisible} />
        </Experiment>
      </div>
      <div ref={particlesRef} className={styles.particles}>
        <Experiment
          index="B"
          title={t('lab.particles.title')}
          description={t('lab.particles.desc')}
        >
          <ParticleLab active={particlesVisible} />
        </Experiment>
      </div>
      <div className={styles.terminal}>
        <Experiment index="C" title={t('lab.terminal.title')} description={t('lab.terminal.desc')}>
          <Terminal />
        </Experiment>
      </div>
    </div>
  );
}

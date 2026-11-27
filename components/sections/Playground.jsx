'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import TextReveal from '@/components/motion/TextReveal';
import { useI18n } from '@/providers/LanguageProvider';
import styles from './Playground.module.css';

function LabSkeleton() {
  const { t } = useI18n();
  return (
    <div className={styles.skeleton} role="status">
      <span className="t-label">{t('lab.loading')}</span>
    </div>
  );
}

// The whole lab (its own small WebGL canvas, 2D canvas and terminal) is a separate chunk
const LabExperiments = dynamic(() => import('@/components/lab/LabExperiments'), {
  ssr: false,
  loading: () => <LabSkeleton />,
});

/** THE LAB — mounted only when the visitor approaches it. */
export default function Playground() {
  const { t } = useI18n();
  const sentinel = useRef(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const element = sentinel.current;
    if (!element) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: '900px 0px' },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="lab"
      ref={sentinel}
      className={`section ${styles.lab}`}
      aria-labelledby="lab-title"
    >
      <div className="container">
        <div className={styles.head}>
          <span className="t-label">{t('lab.index')}</span>
          <TextReveal as="h2" id="lab-title" className={`t-mega ${styles.title}`} type="chars">
            {t('lab.title')}
          </TextReveal>
          <p className={`t-body ${styles.intro}`}>{t('lab.intro')}</p>
        </div>
        {near ? <LabExperiments /> : <LabSkeleton />}
      </div>
    </section>
  );
}

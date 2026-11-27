'use client';

import { useRef } from 'react';
import TextReveal from '@/components/motion/TextReveal';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';
import { milestones } from '@/data/experience';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useI18n } from '@/providers/LanguageProvider';
import styles from './Experience.module.css';

export default function Experience() {
  const root = useRef(null);
  const { t, pick } = useI18n();
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const items = gsap.utils.toArray('[data-milestone]');

      // the connecting line draws itself with scroll
      gsap.fromTo(
        '[data-line-fill]',
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: '[data-timeline]',
            start: 'top 60%',
            end: 'bottom 60%',
            scrub: reduced ? false : 0.4,
          },
        },
      );

      items.forEach((item) => {
        // active milestone indicator
        ScrollTrigger.create({
          trigger: item,
          start: 'top 62%',
          end: 'bottom 62%',
          toggleClass: { targets: item, className: styles.active },
        });
        ScrollTrigger.create({
          trigger: item,
          start: 'top 62%',
          onEnter: () => item.classList.add(styles.passed),
          onLeaveBack: () => item.classList.remove(styles.passed),
        });
        if (reduced) return;
        // progressive content reveal
        gsap.from(item.querySelectorAll('[data-m-reveal]'), {
          y: 36,
          autoAlpha: 0,
          duration: 1,
          stagger: 0.08,
          ease: 'expo.out',
          scrollTrigger: { trigger: item, start: 'top 82%', once: true },
        });
      });
    },
    { scope: root, dependencies: [reduced] },
  );

  return (
    <section
      id="experience"
      ref={root}
      className={`section ${styles.experience}`}
      aria-labelledby="experience-title"
    >
      <div className="container">
        <div className={styles.head}>
          <span className="t-label">{t('experience.index')}</span>
          <TextReveal as="h2" id="experience-title" className={`t-h2 ${styles.title}`} type="lines">
            {t('experience.title')}
          </TextReveal>
          <p className={`t-body ${styles.intro}`}>{t('experience.intro')}</p>
        </div>

        <div className={styles.timeline} data-timeline>
          <span className={styles.line} aria-hidden="true">
            <span className={styles.lineFill} data-line-fill />
          </span>
          <ol className={styles.list}>
            {milestones.map((milestone, index) => {
              const highlights = pick(milestone.highlights);
              return (
                <li key={milestone.id} className={styles.milestone} data-milestone>
                  <span className={styles.node} aria-hidden="true" />
                  <div className={styles.meta} data-m-reveal>
                    <span className="t-label">
                      {t('experience.chapter')} {String(index + 1).padStart(2, '0')}
                    </span>
                    {milestone.date && (
                      <span className={`t-label ${styles.date}`}>{milestone.date}</span>
                    )}
                  </div>
                  <div className={styles.content}>
                    <h3 className={`t-h3 ${styles.mTitle}`} data-m-reveal>
                      {pick(milestone.title)}
                    </h3>
                    <p className="t-body" data-m-reveal>
                      {pick(milestone.text)}
                    </p>
                    {Array.isArray(highlights) && highlights.length > 0 && (
                      <ul className={styles.highlights} data-m-reveal>
                        {highlights.map((highlight) => (
                          <li key={highlight}>{highlight}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}

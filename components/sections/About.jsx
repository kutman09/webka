'use client';

import { useRef } from 'react';
import Image from 'next/image';
import TextReveal from '@/components/motion/TextReveal';
import Reveal from '@/components/motion/Reveal';
import Logo from '@/components/ui/Logo';
import { gsap, useGSAP } from '@/lib/gsap';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useI18n } from '@/providers/LanguageProvider';
import { profile } from '@/data/profile';
import styles from './About.module.css';

/** Abstract NK composition used until a real photo is set in data/profile.js. */
function PortraitComposition({ alt }) {
  return (
    <div className={styles.composition} role="img" aria-label={alt}>
      <div className={styles.gridLines} aria-hidden="true" />
      <div className={styles.compMark} aria-hidden="true" data-parallax-inner>
        <Logo size={260} strokeWidth={0.9} showJoint={false} />
      </div>
      <div className={styles.compMarkSolid} aria-hidden="true">
        <Logo size={88} strokeWidth={3} />
      </div>
      <span className={styles.scan} aria-hidden="true" />
      <span className={`t-label ${styles.cornerTL}`} aria-hidden="true">
        N 42.87°
      </span>
      <span className={`t-label ${styles.cornerBR}`} aria-hidden="true">
        E 74.59°
      </span>
    </div>
  );
}

export default function About() {
  const root = useRef(null);
  const { t } = useI18n();
  const reduced = useReducedMotion();
  const focus = t('about.focus');

  // mask reveal + scroll-linked image movement
  useGSAP(
    () => {
      if (reduced) return;
      gsap.fromTo(
        '[data-portrait]',
        { clipPath: 'inset(18% 12% 18% 12%)' },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          ease: 'none',
          scrollTrigger: {
            trigger: '[data-portrait]',
            start: 'top 90%',
            end: 'top 35%',
            scrub: true,
          },
        },
      );
      gsap.fromTo(
        '[data-parallax-inner]',
        { yPercent: -12, scale: 1.08 },
        {
          yPercent: 12,
          scale: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: '[data-portrait]',
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        },
      );
    },
    { scope: root, dependencies: [reduced] },
  );

  return (
    <section
      id="about"
      ref={root}
      className={`section ${styles.about}`}
      aria-labelledby="about-title"
    >
      <div className="container">
        <div className={styles.head}>
          <span className="t-label">{t('about.index')}</span>
          <TextReveal as="h2" id="about-title" className={`t-h1 ${styles.title}`} type="words">
            {t('about.title')}
          </TextReveal>
        </div>

        <div className={`grid ${styles.body}`}>
          <figure className={styles.portrait} data-portrait>
            <div className={styles.portraitInner}>
              {profile.photo ? (
                <Image
                  src={profile.photo}
                  alt={profile.name}
                  fill
                  sizes="(max-width: 900px) 100vw, 40vw"
                  className={styles.photo}
                  data-parallax-inner
                />
              ) : (
                <PortraitComposition alt={t('about.portraitAlt')} />
              )}
            </div>
            <figcaption className="t-label">
              {profile.photo ? profile.name : t('about.portraitNote')}
            </figcaption>
          </figure>

          <div className={styles.text}>
            <TextReveal as="p" className={`t-lead ${styles.lead}`} type="lines">
              {t('about.p1')}
            </TextReveal>
            <TextReveal as="p" className="t-body" type="lines" delay={0.1}>
              {t('about.p2')}
            </TextReveal>

            <div className={styles.focus}>
              <p className="t-label">{t('about.focusTitle')}</p>
              <Reveal as="ol" className={styles.focusList} variant="slide" stagger={0.08}>
                {Array.isArray(focus) &&
                  focus.map((item, index) => (
                    <li key={item} data-reveal>
                      <span className={styles.focusIndex}>
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className={styles.focusName}>{item}</span>
                    </li>
                  ))}
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

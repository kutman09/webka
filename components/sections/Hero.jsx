'use client';

import { useRef } from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import TextReveal from '@/components/motion/TextReveal';
import Button from '@/components/ui/Button';
import LocalTime from '@/components/ui/LocalTime';
import { gsap, useGSAP } from '@/lib/gsap';
import { useSceneValue } from '@/lib/sceneStore';
import { useI18n } from '@/providers/LanguageProvider';
import { useSmoothScroll } from '@/providers/SmoothScrollProvider';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { profile } from '@/data/profile';
import styles from './Hero.module.css';

export default function Hero() {
  const root = useRef(null);
  const { t } = useI18n();
  const { scrollTo } = useSmoothScroll();
  const introDone = useSceneValue('introDone');
  const reduced = useReducedMotion();

  // intro: meta lines + buttons arrive after the preloader
  useGSAP(
    () => {
      const items = gsap.utils.toArray('[data-hero-fade]');
      if (reduced) {
        gsap.set(items, { autoAlpha: 1 });
        return;
      }
      if (!introDone) {
        gsap.set(items, { autoAlpha: 0, y: 24 });
        return;
      }
      gsap.to(items, {
        autoAlpha: 1,
        y: 0,
        duration: 1.2,
        stagger: 0.07,
        delay: 0.45,
        ease: 'expo.out',
      });
    },
    { scope: root, dependencies: [introDone, reduced] },
  );

  // scroll: the headline drifts up and dissolves as the camera dives into the core
  useGSAP(
    () => {
      if (reduced) return;
      gsap.to('[data-hero-content]', {
        yPercent: -18,
        autoAlpha: 0,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom 20%', scrub: true },
      });
    },
    { scope: root, dependencies: [reduced] },
  );

  const go = (id) => (event) => {
    event.preventDefault();
    scrollTo(`#${id}`);
  };

  return (
    <section id="home" ref={root} className={styles.hero} aria-labelledby="hero-title">
      <div className={`container ${styles.frame}`} data-hero-content>
        <div className={styles.top}>
          <span className="t-label" data-hero-fade>
            {t('hero.index')}
          </span>
          <span className={`t-label ${styles.coreLabel}`} data-hero-fade>
            <span className={styles.dot} aria-hidden="true" />
            {t('hero.coreLabel')}
          </span>
          <LocalTime label={t('hero.localTime')} className={styles.time} data-hero-fade />
        </div>

        <div className={styles.headline}>
          <p className={`t-label ${styles.hello}`} data-hero-fade>
            <span className={styles.dash} aria-hidden="true" />
            {t('hero.hello')}
          </p>
          <h1 id="hero-title" className={`t-mega ${styles.title}`}>
            <TextReveal as="span" type="chars" intro className={styles.line}>
              {profile.lastName}
            </TextReveal>
            <span className={styles.secondRow}>
              <span className={`${styles.role} t-label`} data-hero-fade aria-hidden="true">
                {t('hero.role')}
              </span>
              <TextReveal
                as="span"
                type="chars"
                intro
                delay={0.12}
                className={`${styles.line} ${styles.indent}`}
              >
                {profile.firstName}
              </TextReveal>
            </span>
          </h1>
          <p className="sr-only">{t('hero.role')}</p>
        </div>

        <div className={styles.bottom}>
          <p className={`t-lead ${styles.description}`} data-hero-fade>
            {t('hero.description')}
          </p>
          <div className={styles.actions} data-hero-fade>
            <Button href="#projects" size="l" icon={ArrowDownRight} onClick={go('projects')}>
              {t('hero.explore')}
            </Button>
            <Button
              href="#contact"
              variant="ghost"
              size="l"
              icon={ArrowUpRight}
              onClick={go('contact')}
            >
              {t('hero.contact')}
            </Button>
          </div>
          <div className={styles.meta} data-hero-fade>
            <span className="t-label">{t('hero.location')}</span>
            <span className={`t-label ${styles.coords}`}>42.87° N · 74.59° E</span>
          </div>
        </div>

        <a href="#about" className={styles.scroll} onClick={go('about')} data-hero-fade>
          <span className={styles.scrollLine} aria-hidden="true" />
          <span className="t-label">{t('hero.scroll')}</span>
        </a>
      </div>
    </section>
  );
}

'use client';

import { useRef } from 'react';
import TextReveal from '@/components/motion/TextReveal';
import ProjectCard from '@/components/ui/ProjectCard';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';
import { projects } from '@/data/projects';
import { useI18n } from '@/providers/LanguageProvider';
import styles from './Projects.module.css';

/**
 * Desktop (≥1024px, motion allowed): a pinned horizontal gallery driven by vertical
 * scroll. Everywhere else: a normal vertical gallery. Keyboard focus inside the
 * horizontal track scrolls the page to the focused card, so tabbing never gets lost.
 */
export default function Projects() {
  const root = useRef(null);
  const track = useRef(null);
  const counter = useRef(null);
  const { t } = useI18n();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
        const distance = () => track.current.scrollWidth - window.innerWidth;
        const tween = gsap.to(track.current, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: root.current,
            pin: true,
            scrub: 0.8,
            start: 'top top',
            end: () => `+=${distance()}`,
            invalidateOnRefresh: true,
            anticipatePin: 1,
            onUpdate: (self) => {
              const index = Math.min(
                projects.length,
                Math.max(1, Math.round(self.progress * (projects.length - 1)) + 1),
              );
              if (counter.current) counter.current.textContent = String(index).padStart(2, '0');
              root.current.style.setProperty('--progress', self.progress.toFixed(4));
            },
          },
        });

        // each visual unmasks as it travels into view
        gsap.utils.toArray('[data-project-image]').forEach((image) => {
          gsap.fromTo(
            image,
            { clipPath: 'inset(0% 0% 0% 100%)', scale: 1.25 },
            {
              clipPath: 'inset(0% 0% 0% 0%)',
              scale: 1,
              ease: 'none',
              scrollTrigger: {
                trigger: image,
                containerAnimation: tween,
                start: 'left 100%',
                end: 'left 45%',
                scrub: true,
              },
            },
          );
        });

        // keyboard: bring the focused card into the viewport
        const onFocus = (event) => {
          const card = event.target.closest('[data-project-card]');
          // keyboard only — a mouse press also focuses links and must not move the track
          if (!card || !event.target.matches(':focus-visible')) return;
          const st = tween.scrollTrigger;
          const offset = card.offsetLeft - window.innerWidth * 0.2;
          const progress = gsap.utils.clamp(0, 1, offset / distance());
          window.scrollTo({ top: st.start + (st.end - st.start) * progress, behavior: 'auto' });
        };
        track.current.addEventListener('focusin', onFocus);
        return () => track.current?.removeEventListener('focusin', onFocus);
      });

      mm.add('(max-width: 1023px) and (prefers-reduced-motion: no-preference)', () => {
        gsap.utils.toArray('[data-project-image]').forEach((image) => {
          gsap.fromTo(
            image,
            { clipPath: 'inset(100% 0% 0% 0%)' },
            {
              clipPath: 'inset(0% 0% 0% 0%)',
              duration: 1.3,
              ease: 'expo.out',
              scrollTrigger: { trigger: image, start: 'top 88%', once: true },
            },
          );
        });
      });

      // fonts can change widths: re-measure once everything is ready
      document.fonts?.ready.then(() => ScrollTrigger.refresh());
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section id="projects" ref={root} className={styles.projects} aria-labelledby="projects-title">
      <div className={styles.viewport}>
        <div ref={track} className={styles.track}>
          <header className={styles.intro}>
            <span className="t-label">{t('projects.index')}</span>
            <TextReveal as="h2" id="projects-title" className={`t-h1 ${styles.title}`} type="chars">
              {t('projects.title')}
            </TextReveal>
            <p className={`t-label ${styles.subtitle}`}>{t('projects.subtitle')}</p>
            <p className={`t-body ${styles.introText}`}>{t('projects.intro')}</p>
            <div className={styles.counter} aria-hidden="true">
              <span ref={counter} className={styles.current}>
                01
              </span>
              <span className={styles.total}>/ {String(projects.length).padStart(2, '0')}</span>
              <span className={styles.progress}>
                <span />
              </span>
            </div>
          </header>

          <ol className={styles.list}>
            {projects.map((project, index) => (
              <li key={project.slug} className={styles.item}>
                <ProjectCard project={project} priority={index === 0} />
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

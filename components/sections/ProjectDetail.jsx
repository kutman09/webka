'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, CodeXml, ExternalLink } from 'lucide-react';
import TextReveal from '@/components/motion/TextReveal';
import Reveal from '@/components/motion/Reveal';
import Button from '@/components/ui/Button';
import ProjectVisual from '@/components/ui/ProjectVisual';
import TransitionLink from '@/components/motion/TransitionLink';
import { gsap, useGSAP } from '@/lib/gsap';
import { getAdjacentProject, getProject, projects } from '@/data/projects';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useI18n } from '@/providers/LanguageProvider';
import styles from './ProjectDetail.module.css';

export default function ProjectDetail({ slug }) {
  const project = getProject(slug);
  const next = getAdjacentProject(slug);
  const { t, pick } = useI18n();
  const root = useRef(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      gsap.fromTo(
        '[data-detail-visual]',
        { clipPath: 'inset(12% 8% 12% 8% round 28px)', scale: 1.08 },
        {
          clipPath: 'inset(0% 0% 0% 0% round 14px)',
          scale: 1,
          duration: 1.6,
          ease: 'expo.out',
          delay: 0.35,
        },
      );
      gsap.to('[data-detail-visual-inner]', {
        yPercent: 10,
        ease: 'none',
        scrollTrigger: {
          trigger: '[data-detail-visual]',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    },
    { scope: root, dependencies: [reduced] },
  );

  const focus = pick(project.focus) ?? [];
  const hasLinks = project.links.github || project.links.live;

  return (
    <main id="main" tabIndex={-1} ref={root} className={styles.page}>
      <div className="container">
        <nav className={styles.crumbs} aria-label="Breadcrumb">
          <TransitionLink href="/" className={styles.back} data-cursor="link">
            <ArrowLeft size={16} strokeWidth={1.75} aria-hidden="true" />
            {t('projects.back')}
          </TransitionLink>
          <span className="t-label">
            {project.number} / {String(projects.length).padStart(2, '0')}
          </span>
        </nav>

        <header className={styles.header}>
          <p className={`t-label ${styles.category}`}>{pick(project.category)}</p>
          <TextReveal as="h1" type="chars" className={`t-h1 ${styles.title}`}>
            {project.title}
          </TextReveal>
        </header>
      </div>

      <div className={`container ${styles.visualWrap}`}>
        <div className={styles.visual} data-detail-visual>
          <div className={styles.visualInner} data-detail-visual-inner>
            {project.image ? (
              <Image src={project.image} alt={project.title} fill priority sizes="100vw" />
            ) : (
              <ProjectVisual visual={project.visual} number={project.number} />
            )}
          </div>
        </div>
      </div>

      <div className={`container grid ${styles.body}`}>
        <Reveal as="dl" className={styles.facts} variant="rise" stagger={0.07}>
          <div data-reveal>
            <dt className="t-label">{t('projects.category')}</dt>
            <dd>{pick(project.category)}</dd>
          </div>
          <div data-reveal>
            <dt className="t-label">{t('projects.status')}</dt>
            <dd>
              <span className={styles.status}>{t(`projects.statuses.${project.status}`)}</span>
            </dd>
          </div>
          <div data-reveal>
            <dt className="t-label">{t('projects.stack')}</dt>
            <dd>
              {project.tech.length ? (
                <ul className={styles.tech}>
                  {project.tech.map((tech) => (
                    <li key={tech}>{tech}</li>
                  ))}
                </ul>
              ) : (
                <span className={styles.muted}>{t('projects.stackTbd')}</span>
              )}
            </dd>
          </div>
        </Reveal>

        <div className={styles.content}>
          <p className="t-label">{t('projects.overview')}</p>
          <TextReveal as="p" type="lines" className={`t-lead ${styles.lead}`}>
            {pick(project.description)}
          </TextReveal>

          {focus.length > 0 && (
            <div className={styles.focus}>
              <p className="t-label">{t('projects.focus')}</p>
              <Reveal as="ol" className={styles.focusList} variant="slide" stagger={0.07}>
                {focus.map((item, index) => (
                  <li key={item} data-reveal>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    {item}
                  </li>
                ))}
              </Reveal>
            </div>
          )}

          <div className={styles.links}>
            {project.links.github && (
              <Button href={project.links.github} external icon={CodeXml} variant="ghost">
                {t('projects.github')}
              </Button>
            )}
            {project.links.live && (
              <Button href={project.links.live} external icon={ExternalLink}>
                {t('projects.live')}
              </Button>
            )}
            {!hasLinks && <p className={styles.muted}>{t('projects.noLinks')}</p>}
          </div>
        </div>
      </div>

      <TransitionLink href={`/projects/${next.slug}`} className={styles.next} data-cursor="view">
        <div className="container">
          <span className="t-label">{t('projects.next')}</span>
          <span className={styles.nextTitle}>
            <span>{next.title}</span>
            <ArrowRight className={styles.nextIcon} aria-hidden="true" />
          </span>
        </div>
      </TransitionLink>
    </main>
  );
}

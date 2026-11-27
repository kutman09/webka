'use client';

import { useId, useRef } from 'react';
import Image from 'next/image';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import TransitionLink from '@/components/motion/TransitionLink';
import ProjectVisual from './ProjectVisual';
import { useFinePointer, useReducedMotion } from '@/hooks/useReducedMotion';
import { useI18n } from '@/providers/LanguageProvider';
import styles from './ProjectCard.module.css';

const SPRING = { stiffness: 180, damping: 20, mass: 0.5 };

/**
 * A project presented as an editorial case: oversized number, large visual with
 * perspective tilt and a liquid displacement on hover, then meta and stack.
 */
export default function ProjectCard({ project, priority = false }) {
  const { t, pick } = useI18n();
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const interactive = fine && !reduced;
  const filterId = `distort-${useId().replace(/:/g, '')}`;
  const displacement = useRef(null);
  const frame = useRef(0);
  const amount = useRef(0);

  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [7, -7]), SPRING);
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-9, 9]), SPRING);

  const animateDistortion = (target) => {
    cancelAnimationFrame(frame.current);
    const step = () => {
      amount.current += (target - amount.current) * 0.12;
      displacement.current?.setAttribute('scale', amount.current.toFixed(2));
      if (Math.abs(target - amount.current) > 0.2) frame.current = requestAnimationFrame(step);
    };
    frame.current = requestAnimationFrame(step);
  };

  const onMove = (event) => {
    if (!interactive) return;
    const rect = event.currentTarget.getBoundingClientRect();
    px.set((event.clientX - rect.left) / rect.width - 0.5);
    py.set((event.clientY - rect.top) / rect.height - 0.5);
  };
  const onEnter = () => interactive && animateDistortion(28);
  const onLeave = () => {
    px.set(0);
    py.set(0);
    if (interactive) animateDistortion(0);
  };

  const href = `/projects/${project.slug}`;
  const category = pick(project.category);

  return (
    <article className={styles.card} data-project-card>
      <svg className={styles.defs} aria-hidden="true" focusable="false">
        <filter id={filterId} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.03" numOctaves="2" seed="4" />
          <feDisplacementMap
            ref={displacement}
            in="SourceGraphic"
            scale="0"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>

      <div className={styles.header}>
        <span className={styles.number} aria-hidden="true">
          {project.number}
        </span>
        <span className="t-label">{category}</span>
      </div>

      <TransitionLink
        href={href}
        className={styles.visualLink}
        data-cursor="view"
        tabIndex={-1}
        aria-hidden="true"
        onPointerMove={onMove}
        onPointerEnter={onEnter}
        onPointerLeave={onLeave}
      >
        <motion.div
          className={styles.visual}
          style={interactive ? { rotateX, rotateY } : undefined}
          data-project-visual
        >
          <div className={styles.visualInner} data-project-image>
            {project.image ? (
              <Image
                src={project.image}
                alt=""
                fill
                sizes="(max-width: 1023px) 100vw, 60vw"
                priority={priority}
              />
            ) : (
              <ProjectVisual
                visual={project.visual}
                number={project.number}
                filterId={interactive ? filterId : undefined}
              />
            )}
          </div>
          <span className={styles.glare} aria-hidden="true" />
        </motion.div>
      </TransitionLink>

      <div className={styles.info}>
        <h3 className={`t-h3 ${styles.title}`}>
          <TransitionLink href={href} className={styles.titleLink} data-cursor="link">
            {project.title}
          </TransitionLink>
        </h3>
        <p className={`t-body ${styles.description}`}>{pick(project.description)}</p>
        {project.tech.length > 0 && (
          <ul className={styles.tech} aria-label={t('projects.stack')}>
            {project.tech.map((tech) => (
              <li key={tech}>{tech}</li>
            ))}
          </ul>
        )}
        <TransitionLink
          href={href}
          className={styles.more}
          data-cursor="link"
          tabIndex={-1}
          aria-hidden="true"
        >
          {t('projects.viewCase')}
          <ArrowUpRight size={16} strokeWidth={1.75} />
        </TransitionLink>
      </div>
    </article>
  );
}

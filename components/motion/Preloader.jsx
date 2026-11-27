'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import Logo from '@/components/ui/Logo';
import { sceneStore } from '@/lib/sceneStore';
import { useI18n } from '@/providers/LanguageProvider';
import { useSmoothScroll } from '@/providers/SmoothScrollProvider';
import styles from './Preloader.module.css';

const VISITED_KEY = 'nk-visited';
const MAX_WAIT = 2.6; // seconds — never hold the visitor longer than this for the 3D scene
let playedThisSession = false;

function isReturningVisitor() {
  try {
    return window.localStorage.getItem(VISITED_KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * Real-progress preloader. Two real tasks are tracked: web fonts and the first
 * rendered frame of the WebGL scene (or its static fallback). Nothing is delayed
 * artificially: the reveal starts as soon as both are ready and the mark has drawn.
 */
export default function Preloader() {
  const root = useRef(null);
  const exitRef = useRef(null);
  const drawRef = useRef(null);
  const { t } = useI18n();
  const { lenis } = useSmoothScroll();
  const [visible, setVisible] = useState(!playedThisSession);
  const [progress, setProgress] = useState({ fonts: false, scene: false });

  // Track real tasks
  useEffect(() => {
    if (playedThisSession) {
      sceneStore.set({ introDone: true });
      return undefined;
    }
    let alive = true;
    document.fonts?.ready.then(() => alive && setProgress((p) => ({ ...p, fonts: true })));
    const check = () => {
      if (sceneStore.get().ready) setProgress((p) => (p.scene ? p : { ...p, scene: true }));
    };
    check();
    const unsubscribe = sceneStore.subscribe(check);
    return () => {
      alive = false;
      unsubscribe();
    };
  }, []);

  const done = progress.fonts && progress.scene;
  const percent = Math.round(((progress.fonts ? 1 : 0) + (progress.scene ? 1 : 0)) * 50);

  useGSAP(
    () => {
      if (!visible) return;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const returning = isReturningVisitor();
      lenis.current?.stop();

      const finish = () => {
        playedThisSession = true;
        try {
          window.localStorage.setItem(VISITED_KEY, '1');
        } catch {
          /* ignore */
        }
        lenis.current?.start();
        sceneStore.set({ introDone: true });
        setVisible(false);
      };

      const segments = root.current.querySelectorAll('[data-segment]');
      const joint = root.current.querySelector('[data-joint]');
      const mark = root.current.querySelector(`.${styles.mark}`);
      const panel = root.current;

      if (reduced) {
        gsap.set(segments, { strokeDashoffset: 0 });
        exitRef.current = () => gsap.to(panel, { autoAlpha: 0, duration: 0.3, onComplete: finish });
        return;
      }

      const draw = gsap.timeline();
      gsap.set(segments, { strokeDasharray: 1, strokeDashoffset: 1 });
      gsap.set(joint, { scale: 0, transformOrigin: '50% 50%' });

      if (returning) {
        gsap.set(segments, { strokeDashoffset: 0 });
        gsap.set(joint, { scale: 1 });
      } else {
        draw
          .fromTo(
            mark,
            { autoAlpha: 0, scale: 0.92 },
            { autoAlpha: 1, scale: 1, duration: 0.3, ease: 'power2.out' },
          )
          .to(
            segments,
            { strokeDashoffset: 0, duration: 0.6, stagger: 0.08, ease: 'power3.inOut' },
            0.3,
          )
          .to(joint, { scale: 1, duration: 0.35, ease: 'back.out(3)' }, 0.75);
      }

      exitRef.current = () => {
        const exit = gsap.timeline({ onComplete: finish });
        if (!returning) {
          exit.to(mark, { scale: 9, autoAlpha: 0, duration: 0.55, ease: 'expo.in' });
        } else {
          exit.to(mark, { autoAlpha: 0, duration: 0.2 });
        }
        exit.to(`.${styles.meta}`, { autoAlpha: 0, duration: 0.25 }, 0).to(
          panel,
          {
            clipPath: 'inset(0% 0% 100% 0%)',
            duration: returning ? 0.5 : 0.6,
            ease: 'expo.inOut',
          },
          '>-0.15',
        );
      };
      drawRef.current = draw;
    },
    { scope: root, dependencies: [visible] },
  );

  // Exit when assets are ready and the mark has finished drawing — or after MAX_WAIT
  useEffect(() => {
    if (!visible) return undefined;
    let exited = false;
    const exit = () => {
      if (exited || !exitRef.current) return;
      exited = true;
      exitRef.current();
    };
    const timer = window.setTimeout(exit, MAX_WAIT * 1000);
    if (done) {
      const draw = drawRef.current;
      if (draw && draw.progress() < 1) draw.eventCallback('onComplete', exit);
      else exit();
    }
    return () => window.clearTimeout(timer);
  }, [done, visible]);

  if (!visible) return null;

  const status = !progress.fonts
    ? t('preloader.fonts')
    : !progress.scene
      ? t('preloader.scene')
      : t('preloader.ready');

  return (
    <div
      ref={root}
      className={styles.preloader}
      data-preloader
      role="status"
      aria-live="polite"
      aria-label={status}
    >
      <div className={styles.mark}>
        <Logo size={132} strokeWidth={2} title="NK" />
      </div>
      <div className={styles.meta} aria-hidden="true">
        <span className="t-label">{status}</span>
        <span className={`t-label ${styles.percent}`}>{String(percent).padStart(3, '0')}%</span>
      </div>
      <div className={styles.bar} aria-hidden="true">
        <span style={{ transform: `scaleX(${percent / 100})` }} />
      </div>
    </div>
  );
}

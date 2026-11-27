'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { ScrollTrigger } from '@/lib/gsap';
import { useDevicePerformance } from '@/hooks/useDevicePerformance';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useMousePosition } from '@/hooks/useMousePosition';
import { sceneStore } from '@/lib/sceneStore';
import { sampleTimeline } from '@/lib/sceneTimeline';
import { SECTION_ORDER } from '@/lib/navigation';
import SceneFallback from './SceneFallback';
import styles from './SceneMount.module.css';

// three.js + R3F + postprocessing are split into their own chunk and never SSR'd
const Scene = dynamic(() => import('./Scene'), { ssr: false });

/**
 * Scroll director: converts scroll position into the continuous timeline value
 * (section index + how much of the next section is visible), fades the stage and
 * pauses the WebGL loop when it is invisible.
 */
function useSceneDirector(stageRef) {
  useEffect(() => {
    let sections = [];
    const sample = {};

    const measure = () => {
      sections = SECTION_ORDER.map((id) => document.getElementById(id))
        .filter(Boolean)
        .map((element) => {
          const box = element.parentElement?.classList.contains('pin-spacer')
            ? element.parentElement
            : element;
          const rect = box.getBoundingClientRect();
          return { top: rect.top + window.scrollY, bottom: rect.bottom + window.scrollY };
        });
    };

    const update = () => {
      if (!sections.length) return;
      const y = window.scrollY;
      const vh = window.innerHeight;
      let index = 0;
      for (let i = 0; i < sections.length; i += 1) if (sections[i].top <= y + 1) index = i;
      const f = Math.min(Math.max((y + vh - sections[index].bottom) / vh, 0), 1);
      const timeline = index + f;
      sceneStore.mutate({ timeline });

      sampleTimeline(timeline, window.innerWidth / window.innerHeight < 0.9, sample);
      if (stageRef.current) stageRef.current.style.opacity = sample.opacity.toFixed(3);
      sceneStore.set({
        mainSceneVisible: sample.opacity > 0.01,
        universeOn: sample.universe > 0.6,
      });
    };

    const refresh = () => {
      measure();
      update();
    };

    refresh();
    const raf = requestAnimationFrame(refresh);
    ScrollTrigger.addEventListener('refresh', refresh);
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', refresh);

    // lazy content (the Lab, fonts, images) changes the page height:
    // re-measure every ScrollTrigger once the layout settles
    let debounce = 0;
    let lastHeight = document.documentElement.scrollHeight;
    const observer = new ResizeObserver(() => {
      const height = document.documentElement.scrollHeight;
      if (Math.abs(height - lastHeight) < 2) return;
      lastHeight = height;
      window.clearTimeout(debounce);
      debounce = window.setTimeout(() => ScrollTrigger.refresh(), 150);
    });
    const main = document.getElementById('main');
    if (main) observer.observe(main);

    return () => {
      observer.disconnect();
      window.clearTimeout(debounce);
      cancelAnimationFrame(raf);
      ScrollTrigger.removeEventListener('refresh', refresh);
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', refresh);
    };
  }, [stageRef]);
}

/** Fixed stage behind the page: WebGL scene, or the static fallback without WebGL. */
export default function SceneMount() {
  const detected = useDevicePerformance();
  const reduced = useReducedMotion();
  const [lost, setLost] = useState(false);
  const [idle, setIdle] = useState(false);
  const stageRef = useRef(null);
  const quality = lost ? 'static' : detected;

  // start three.js only once hydration has finished and the main thread is idle,
  // so shader compilation does not compete with the first interaction
  useEffect(() => {
    const start = () => setIdle(true);
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(start, { timeout: 1200 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(start, 300);
    return () => window.clearTimeout(id);
  }, []);

  useMousePosition(!reduced);
  useSceneDirector(stageRef);

  useEffect(() => {
    sceneStore.set({ quality });
    if (quality === 'static') sceneStore.set({ ready: true });
  }, [quality]);

  const onContextLost = useCallback(() => setLost(true), []);

  return (
    <div
      ref={stageRef}
      className={styles.stage}
      data-quality={quality ?? 'pending'}
      aria-hidden="true"
    >
      {quality === 'static' && <SceneFallback />}
      {idle && quality && quality !== 'static' && (
        <Scene initialQuality={quality} reduced={reduced} onContextLost={onContextLost} />
      )}
    </div>
  );
}

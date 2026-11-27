'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { NK_SEGMENTS } from '@/lib/nkMark';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useI18n } from '@/providers/LanguageProvider';
import RangeControl from './RangeControl';
import styles from './Lab.module.css';

const SHAPES = ['sphere', 'grid', 'nk', 'wave'];

/** Target positions (normalised -1..1) for every particle in each formation. */
function shapeTargets(shape, count) {
  const targets = new Float32Array(count * 2);
  for (let i = 0; i < count; i += 1) {
    let x = 0;
    let y = 0;
    const u = i / count;
    if (shape === 'sphere') {
      const ring = i % 3;
      const a = u * Math.PI * 2 * 3 + ring;
      const r = 0.35 + ring * 0.2 + Math.sin(u * 40) * 0.02;
      x = Math.cos(a) * r;
      y = Math.sin(a) * r * (ring === 1 ? 0.45 : 1);
    } else if (shape === 'grid') {
      const side = Math.ceil(Math.sqrt(count));
      x = ((i % side) / (side - 1)) * 1.6 - 0.8;
      y = (Math.floor(i / side) / (side - 1)) * 1.6 - 0.8;
    } else if (shape === 'nk') {
      const segment = NK_SEGMENTS[i % NK_SEGMENTS.length];
      const p = Math.random();
      x =
        ((segment[0] + (segment[2] - segment[0]) * p - 24) / 24) * 0.78 +
        (Math.random() - 0.5) * 0.03;
      y =
        ((segment[1] + (segment[3] - segment[1]) * p - 20) / 24) * 0.78 +
        (Math.random() - 0.5) * 0.03;
    } else {
      x = u * 1.8 - 0.9;
      const band = (i % 4) - 1.5;
      y = Math.sin(u * Math.PI * 4) * 0.3 + band * 0.08;
    }
    targets[i * 2] = x;
    targets[i * 2 + 1] = y;
  }
  return targets;
}

/**
 * Canvas 2D particle experiment: springs towards a formation, cursor/finger
 * attracts or repels. The loop stops when the card is off-screen.
 */
export default function ParticleLab({ active }) {
  const { t } = useI18n();
  const reduced = useReducedMotion();
  const id = useId();
  const canvasRef = useRef(null);
  const pointer = useRef({ x: 0, y: 0, inside: false });
  const system = useRef(null);
  const [mode, setMode] = useState('repel');
  const [density, setDensity] = useState(1200);
  const [shape, setShape] = useState('sphere');

  // (re)build particles when density changes
  useEffect(() => {
    const count = density;
    const previous = system.current;
    const positions = new Float32Array(count * 2);
    const velocities = new Float32Array(count * 2);
    for (let i = 0; i < count; i += 1) {
      positions[i * 2] = previous?.positions[i * 2] ?? Math.random() * 2 - 1;
      positions[i * 2 + 1] = previous?.positions[i * 2 + 1] ?? Math.random() * 2 - 1;
    }
    system.current = { count, positions, velocities, targets: shapeTargets(shape, count) };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- shape change handled below
  }, [density]);

  // morph to a new formation
  useEffect(() => {
    if (system.current) system.current.targets = shapeTargets(shape, system.current.count);
  }, [shape]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !active) return undefined;
    const context = canvas.getContext('2d');
    let frame = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    const step = () => {
      const s = system.current;
      if (!s) return;
      const scale = Math.min(width, height) * 0.5;
      const cx = width / 2;
      const cy = height / 2;
      const px = (pointer.current.x - cx) / scale;
      const py = (pointer.current.y - cy) / scale;
      const sign = mode === 'attract' ? -1 : 1;

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.fillStyle = 'rgba(16, 18, 22, 0.32)';
      context.fillRect(0, 0, width, height);

      for (let i = 0; i < s.count; i += 1) {
        const ix = i * 2;
        const iy = ix + 1;
        let vx = s.velocities[ix];
        let vy = s.velocities[iy];
        vx += (s.targets[ix] - s.positions[ix]) * 0.018;
        vy += (s.targets[iy] - s.positions[iy]) * 0.018;

        let near = 0;
        if (pointer.current.inside) {
          const dx = s.positions[ix] - px;
          const dy = s.positions[iy] - py;
          const d2 = dx * dx + dy * dy;
          if (d2 < 0.09) {
            const force = (0.09 - d2) * 0.18 * sign;
            const d = Math.sqrt(d2) + 1e-4;
            vx += (dx / d) * force;
            vy += (dy / d) * force;
            near = 1 - d2 / 0.09;
          }
        }
        vx *= 0.86;
        vy *= 0.86;
        s.velocities[ix] = vx;
        s.velocities[iy] = vy;
        s.positions[ix] += vx;
        s.positions[iy] += vy;

        const x = cx + s.positions[ix] * scale;
        const y = cy + s.positions[iy] * scale;
        context.fillStyle = near > 0.15 || i % 17 === 0 ? '#b8ff36' : 'rgba(199, 204, 213, 0.85)';
        context.fillRect(x, y, 1.6, 1.6);
      }
    };

    const loop = () => {
      step();
      frame = requestAnimationFrame(loop);
    };
    if (reduced) {
      // settle instantly into the formation, draw a single still frame
      const s = system.current;
      if (s) s.positions.set(s.targets);
      step();
    } else {
      frame = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [active, mode, reduced, shape, density]);

  const onPointer = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    pointer.current = { x: event.clientX - rect.left, y: event.clientY - rect.top, inside: true };
  };

  return (
    <div className={styles.experiment}>
      <div className={styles.stage} data-cursor="drag">
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          onPointerMove={onPointer}
          onPointerDown={onPointer}
          onPointerLeave={() => {
            pointer.current.inside = false;
          }}
          aria-label={t('lab.particles.title')}
          role="img"
        />
      </div>
      <div className={styles.controls}>
        <fieldset className={styles.segmented}>
          <legend className={styles.rangeLabel}>{t('lab.particles.mode')}</legend>
          {['attract', 'repel'].map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={mode === value}
              onClick={() => setMode(value)}
            >
              {t(`lab.particles.${value}`)}
            </button>
          ))}
        </fieldset>
        <RangeControl
          id={`${id}-density`}
          label={t('lab.particles.density')}
          min={300}
          max={2400}
          step={100}
          value={density}
          onChange={setDensity}
        />
        <fieldset className={styles.segmented}>
          <legend className={styles.rangeLabel}>{t('lab.particles.shape')}</legend>
          {SHAPES.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={shape === value}
              onClick={() => setShape(value)}
            >
              {t(`lab.particles.shapes.${value}`)}
            </button>
          ))}
        </fieldset>
      </div>
    </div>
  );
}

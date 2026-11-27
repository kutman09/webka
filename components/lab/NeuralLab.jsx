'use client';

import { useId, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Zap } from 'lucide-react';
import NeuralNetwork from '@/components/three/NeuralNetwork';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useI18n } from '@/providers/LanguageProvider';
import { detectQuality } from '@/hooks/useDevicePerformance';
import RangeControl from './RangeControl';
import styles from './Lab.module.css';

function hasWebGL() {
  if (typeof window === 'undefined') return false;
  return detectQuality() !== 'static';
}

export default function NeuralLab({ active }) {
  const { t } = useI18n();
  const reduced = useReducedMotion();
  const id = useId();
  const [hidden, setHidden] = useState(2);
  const [neurons, setNeurons] = useState(6);
  const [speed, setSpeed] = useState(1);
  const [fireToken, setFireToken] = useState(0);
  const [webgl] = useState(hasWebGL);

  return (
    <div className={styles.experiment}>
      <div className={styles.stage} data-cursor="drag">
        {webgl ? (
          <Canvas
            dpr={[1, 1.75]}
            frameloop={active ? 'always' : 'never'}
            camera={{ position: [0, 0, 7.2], fov: 40 }}
            gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
            aria-label={t('lab.neural.title')}
            role="img"
          >
            <NeuralNetwork
              hidden={hidden}
              neurons={neurons}
              speed={speed}
              fireToken={fireToken}
              reduced={reduced}
            />
          </Canvas>
        ) : (
          <p className={styles.noWebgl}>{t('lab.neural.desc')}</p>
        )}
      </div>
      <div className={styles.controls}>
        <RangeControl
          id={`${id}-layers`}
          label={t('lab.neural.layers')}
          min={1}
          max={4}
          value={hidden}
          onChange={setHidden}
        />
        <RangeControl
          id={`${id}-neurons`}
          label={t('lab.neural.neurons')}
          min={3}
          max={8}
          value={neurons}
          onChange={setNeurons}
        />
        <RangeControl
          id={`${id}-speed`}
          label={t('lab.neural.speed')}
          min={0.4}
          max={2.4}
          step={0.2}
          value={speed}
          onChange={setSpeed}
          format={(value) => `${value.toFixed(1)}×`}
        />
        <button
          type="button"
          className={styles.action}
          onClick={() => setFireToken((n) => n + 1)}
          data-cursor="link"
        >
          <Zap size={16} strokeWidth={1.75} aria-hidden="true" />
          {t('lab.neural.fire')}
        </button>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Lightformer, PerformanceMonitor } from '@react-three/drei';
import { Bloom, EffectComposer, ToneMapping, Vignette } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import { MathUtils } from 'three';
import { QUALITY_PRESETS, degradeQuality } from '@/hooks/useDevicePerformance';
import { sceneStore, useSceneValue } from '@/lib/sceneStore';
import CameraController from './CameraController';
import IntelligenceCore from './IntelligenceCore';
import ParticleField from './ParticleField';

/** Procedural studio lighting — no HDR download needed. Rendered once. */
function StudioEnvironment() {
  return (
    <Environment resolution={128} frames={1}>
      <Lightformer
        form="rect"
        intensity={3}
        color="#ffffff"
        position={[0, 4, -6]}
        scale={[10, 2, 1]}
      />
      <Lightformer
        form="rect"
        intensity={1.6}
        color="#c7ccd5"
        position={[-6, 1, 2]}
        rotation-y={Math.PI / 2}
        scale={[8, 1.2, 1]}
      />
      <Lightformer
        form="rect"
        intensity={1.2}
        color="#ffffff"
        position={[6, -1, 1]}
        rotation-y={-Math.PI / 2}
        scale={[6, 0.6, 1]}
      />
      <Lightformer form="ring" intensity={2.2} color="#b8ff36" position={[0, -5, 2]} scale={3} />
    </Environment>
  );
}

/** Marks the scene as ready after the first frames have rendered (feeds the preloader). */
function ReadySignal() {
  const frames = useRef(0);
  useFrame(() => {
    frames.current += 1;
    if (frames.current === 3) sceneStore.set({ ready: true });
  });
  return null;
}

/**
 * Selective bloom by luminance: only materials pushed above 1.0 (the energy core,
 * lit data blocks, active skill nodes) cross the threshold. Film grain is a light
 * CSS overlay on the page instead of a WebGL pass (cheaper, no colour noise).
 */
function Effects() {
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom
        mipmapBlur
        luminanceThreshold={0.9}
        luminanceSmoothing={0.15}
        intensity={0.55}
        radius={0.6}
      />
      <Vignette eskil={false} offset={0.25} darkness={0.75} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  );
}

/**
 * The single, global WebGL canvas of the home page. It sits behind the HTML
 * (pointer-events: none), pauses when the stage is faded out and adapts its
 * quality at runtime through PerformanceMonitor.
 */
export default function Scene({ initialQuality, reduced, onContextLost }) {
  const [quality, setQuality] = useState(initialQuality);
  const preset = QUALITY_PRESETS[quality];
  const [dpr, setDpr] = useState(preset.dpr[1]);
  const visible = useSceneValue('mainSceneVisible');
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const lost = (event) => {
      event.preventDefault();
      onContextLost?.();
    };
    canvas.addEventListener('webglcontextlost', lost);
    return () => canvas.removeEventListener('webglcontextlost', lost);
  }, [onContextLost]);

  return (
    <Canvas
      ref={canvasRef}
      dpr={dpr}
      frameloop={visible ? 'always' : 'never'}
      camera={{ position: [0, 0, 9], fov: 35, near: 0.1, far: 60 }}
      gl={{
        antialias: !preset.post,
        powerPreference: 'high-performance',
        alpha: false,
        stencil: false,
      }}
      events={undefined}
      aria-hidden="true"
    >
      <color attach="background" args={['#07080a']} />
      <fog attach="fog" args={['#07080a', 9, 30]} />
      <PerformanceMonitor
        bounds={() => [40, 75]}
        flipflops={2}
        onChange={({ factor }) => setDpr(MathUtils.lerp(preset.dpr[0], preset.dpr[1], factor))}
        onFallback={() => setQuality((current) => degradeQuality(current))}
      >
        <StudioEnvironment />
        <CameraController reduced={reduced} />
        <IntelligenceCore preset={preset} reduced={reduced} />
        <ParticleField count={preset.particles} reduced={reduced} />
        {preset.post && <Effects />}
        <ReadySignal />
      </PerformanceMonitor>
    </Canvas>
  );
}

'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { MathUtils, Vector3 } from 'three';
import { sceneStore } from '@/lib/sceneStore';
import { sampleTimeline, TIMELINE_KEYS } from '@/lib/sceneTimeline';
import { skillCategories } from '@/data/skills';
import { live } from './live';

const lookTarget = new Vector3();

/**
 * Reads the scroll timeline + pointer from the store, damps every art-direction
 * parameter into `live` (read by the other scene objects) and drives the camera.
 * Runs before other frame subscribers (priority -1, never takes over rendering).
 */
export default function CameraController({ reduced = false }) {
  const camera = useThree((state) => state.camera);
  const target = useRef({});
  const pointer = useRef({ x: 0, y: 0 });
  const initialised = useRef(false);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 20);
    const { timeline, pointer: rawPointer, activeSkill } = sceneStore.get();
    const aspect = camera.aspect || 1;
    const portrait = aspect < 0.9;
    sampleTimeline(timeline, portrait, target.current);

    // first frame snaps to the current section, afterwards everything is damped
    const lambda = reduced ? 12 : 3.2;
    for (const key of TIMELINE_KEYS) {
      live[key] = initialised.current
        ? MathUtils.damp(live[key], target.current[key], lambda, dt)
        : target.current[key];
    }
    initialised.current = true;
    live.portrait = portrait;

    const skillIndex = Math.max(
      0,
      skillCategories.findIndex((category) => category.id === activeSkill),
    );
    live.skillIndex = skillIndex;

    // pointer follow (disabled with reduced motion)
    const follow = reduced ? 0 : 1;
    pointer.current.x = MathUtils.damp(pointer.current.x, rawPointer.x * follow, 2.5, dt);
    pointer.current.y = MathUtils.damp(pointer.current.y, rawPointer.y * follow, 2.5, dt);
    live.pointerX = pointer.current.x;
    live.pointerY = pointer.current.y;

    // portrait screens see less horizontally: pull the camera back
    const portraitFactor = portrait ? MathUtils.clamp(0.72 / aspect, 1, 1.75) : 1;
    // skills: approach the selected orbit (inner orbits come closer)
    const approach = live.universe * (2.4 - skillIndex * 0.28);
    const z = live.camZ * portraitFactor - approach;

    camera.position.set(
      pointer.current.x * 0.45 + live.universe * live.coreX * 0.18,
      pointer.current.y * 0.3 + live.universe * 0.35,
      z,
    );
    lookTarget.set(live.universe * live.coreX * 0.3, 0, live.coreZ * 0.15);
    camera.lookAt(lookTarget);
  }, -1);

  return null;
}

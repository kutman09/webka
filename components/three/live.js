import { sampleTimeline } from '@/lib/sceneTimeline';

/**
 * Damped, per-frame art-direction values written by CameraController and read
 * by every scene object in its own useFrame. Mutable on purpose (hot path).
 */
export const live = {
  ...sampleTimeline(0, false),
  portrait: false,
  skillIndex: 0,
  pointerX: 0,
  pointerY: 0,
};

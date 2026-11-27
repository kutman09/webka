/**
 * Tiny mutable store shared between DOM (GSAP / React) and the WebGL scene.
 * The render loop reads values directly every frame — no React re-renders.
 * React components that need to re-render subscribe through useSceneValue().
 */
import { useSyncExternalStore } from 'react';

const state = {
  // continuous scroll "timeline": 0 = hero, 1 = about, 2 = projects, ...
  timeline: 0,
  // normalised pointer (-1..1)
  pointer: { x: 0, y: 0 },
  activeSkill: 'backend',
  mainSceneVisible: true,
  ready: false,
  introDone: false,
  universeOn: false,
  quality: null,
};

const listeners = new Set();

export const sceneStore = {
  get: () => state,
  set(partial) {
    let changed = false;
    for (const key of Object.keys(partial)) {
      if (state[key] !== partial[key]) {
        state[key] = partial[key];
        changed = true;
      }
    }
    if (changed) listeners.forEach((listener) => listener());
  },
  // hot path: mutate without notifying React
  mutate(partial) {
    Object.assign(state, partial);
  },
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

export function useSceneValue(key) {
  return useSyncExternalStore(
    sceneStore.subscribe,
    () => state[key],
    () => state[key],
  );
}

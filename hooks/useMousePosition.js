'use client';

import { useEffect } from 'react';
import { sceneStore } from '@/lib/sceneStore';

/**
 * Writes the normalised pointer position (-1..1) into the scene store.
 * Used by the 3D scene; mounted once.
 */
export function useMousePosition(enabled = true) {
  useEffect(() => {
    if (!enabled) return undefined;
    const pointer = sceneStore.get().pointer;
    const onMove = (event) => {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -((event.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [enabled]);
}

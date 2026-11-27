'use client';

import { useEffect, useState } from 'react';

/**
 * Quality tiers for the WebGL scenes.
 *  high   — desktop GPUs: bloom, dense particles, detailed geometry, DPR up to 2
 *  medium — laptops / tablets: bloom, fewer particles, DPR up to 1.5
 *  low    — phones / weak CPUs: no post-processing, DPR 1
 *  static — no WebGL, or WebGL without GPU acceleration (SwiftShader, llvmpipe):
 *           a software renderer cannot hold 30 fps, so the CSS/SVG composition is used
 *
 * Override for testing with ?quality=high|medium|low|static
 */
export const QUALITY_PRESETS = {
  high: { particles: 4200, dpr: [1, 2], post: true, segments: 1, instances: 140 },
  medium: { particles: 2600, dpr: [1, 1.5], post: true, segments: 0.75, instances: 90 },
  low: { particles: 1100, dpr: [1, 1], post: false, segments: 0.5, instances: 48 },
  static: null,
};

const TIERS = Object.keys(QUALITY_PRESETS);

function hasWebGL2() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');
    if (!gl) return { ok: false };
    const info = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : '';
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return { ok: true, renderer };
  } catch {
    return { ok: false };
  }
}

export function detectQuality() {
  const override = new URLSearchParams(window.location.search).get('quality');
  if (TIERS.includes(override)) return override;

  const gl = hasWebGL2();
  if (!gl.ok) return 'static';

  const software = /swiftshader|llvmpipe|software|basic render/i.test(gl.renderer);
  const cores = navigator.hardwareConcurrency || 4;
  const memory = navigator.deviceMemory || 4;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const small = Math.min(window.innerWidth, window.innerHeight) < 600;

  if (software) return 'static';
  if (cores <= 2 || memory <= 2) return 'low';
  if (coarse || small) return 'low';
  if (cores >= 8 && memory >= 8 && window.innerWidth >= 1280) return 'high';
  return 'medium';
}

/** Returns null until detected on the client (avoids hydration mismatch). */
export function useDevicePerformance() {
  const [quality, setQuality] = useState(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- detection needs browser APIs
    setQuality(detectQuality());
  }, []);
  return quality;
}

export function degradeQuality(tier) {
  const index = TIERS.indexOf(tier);
  return TIERS[Math.min(index + 1, TIERS.length - 2)];
}

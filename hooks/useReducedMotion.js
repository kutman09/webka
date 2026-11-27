'use client';

import { useMediaQuery } from './useMediaQuery';

export function useReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

export function useFinePointer() {
  return useMediaQuery('(hover: hover) and (pointer: fine)');
}

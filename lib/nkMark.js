/**
 * The NK monogram: the right stem of the N is shared with the K.
 * Segments are [x1, y1, x2, y2] in a 48 × 40 box. Used by the SVG logo,
 * the preloader, the favicon and the 3D monogram, so the brand stays identical.
 */
export const NK_VIEWBOX = { width: 48, height: 40 };
export const NK_JOINT = [24, 20];
export const NK_SEGMENTS = [
  [4, 36, 4, 4],
  [4, 4, 24, 36],
  [24, 36, 24, 4],
  [24, 20, 44, 4],
  [24, 20, 44, 36],
];

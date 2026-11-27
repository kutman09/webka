import { NK_JOINT, NK_SEGMENTS, NK_VIEWBOX } from '@/lib/nkMark';
import styles from './Logo.module.css';

/** NK monogram. `animated` exposes stroke paths for the preloader timeline. */
export default function Logo({
  size = 40,
  className = '',
  title = 'NK',
  strokeWidth = 3,
  showJoint = true,
}) {
  return (
    <svg
      className={`${styles.logo} ${className}`}
      width={size}
      height={(size * NK_VIEWBOX.height) / NK_VIEWBOX.width}
      viewBox={`0 0 ${NK_VIEWBOX.width} ${NK_VIEWBOX.height}`}
      fill="none"
      role="img"
      aria-label={title}
    >
      {NK_SEGMENTS.map(([x1, y1, x2, y2], index) => (
        <line
          key={index}
          data-segment={index}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="square"
          pathLength="1"
        />
      ))}
      {showJoint && (
        <rect
          data-joint
          x={NK_JOINT[0] - 2.5}
          y={NK_JOINT[1] - 2.5}
          width="5"
          height="5"
          fill="var(--c-accent)"
        />
      )}
    </svg>
  );
}

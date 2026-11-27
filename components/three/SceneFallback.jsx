import styles from './SceneFallback.module.css';

/**
 * Static CSS/SVG composition of the Intelligence Core for devices without WebGL.
 * Rings rotate slowly with CSS (stopped under prefers-reduced-motion).
 */
export default function SceneFallback() {
  const rings = [
    { rx: 150, ry: 46, rotate: -18 },
    { rx: 170, ry: 70, rotate: 32 },
    { rx: 190, ry: 30, rotate: 74 },
    { rx: 215, ry: 92, rotate: -52 },
  ];
  return (
    <div className={styles.fallback} aria-hidden="true">
      <svg viewBox="-260 -260 520 520" className={styles.svg}>
        <defs>
          <radialGradient id="fallback-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f2ffd9" />
            <stop offset="35%" stopColor="#b8ff36" />
            <stop offset="100%" stopColor="#b8ff36" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="fallback-chrome" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="45%" stopColor="#7d838e" />
            <stop offset="100%" stopColor="#c7ccd5" />
          </linearGradient>
        </defs>
        <circle r="120" fill="url(#fallback-core)" opacity="0.35" />
        <polygon
          points="0,-112 97,-56 97,56 0,112 -97,56 -97,-56"
          fill="none"
          stroke="url(#fallback-chrome)"
          strokeWidth="1.5"
          className={styles.cage}
        />
        <circle r="44" fill="#b8ff36" opacity="0.9" />
        <circle r="44" fill="none" stroke="#f2ffd9" strokeWidth="2" />
        {rings.map((ring, i) => (
          <g key={i} className={styles.ring} style={{ '--d': `${40 + i * 12}s` }}>
            <ellipse
              rx={ring.rx}
              ry={ring.ry}
              transform={`rotate(${ring.rotate})`}
              fill="none"
              stroke="url(#fallback-chrome)"
              strokeWidth={i === 1 ? 3 : 1.4}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}

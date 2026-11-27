/**
 * Original procedural artwork for each project (no stock imagery).
 * Each is an SVG "poster" in the site's palette; a real screenshot set via
 * `project.image` replaces it automatically (see ProjectCard / project page).
 */
const SILVER = '#c7ccd5';
const DIM = '#3a3f48';
const ACCENT = '#b8ff36';
// fixed precision keeps server and client markup identical
const round = (value) => Math.round(value * 100) / 100;

function Commerce() {
  const cards = [];
  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 4; col += 1) {
      const x = 90 + col * 160;
      const y = 90 + row * 150;
      const hot = row === 1 && col === 2;
      cards.push(
        <g key={`${row}-${col}`} transform={`translate(${x} ${y})`}>
          <rect
            width="130"
            height="120"
            rx="10"
            fill={hot ? ACCENT : 'none'}
            fillOpacity={hot ? 0.12 : 0}
            stroke={hot ? ACCENT : DIM}
          />
          <rect
            x="14"
            y="14"
            width="102"
            height="58"
            rx="6"
            fill="none"
            stroke={hot ? ACCENT : SILVER}
            strokeOpacity={hot ? 1 : 0.4}
          />
          <line
            x1="14"
            y1="88"
            x2="80"
            y2="88"
            stroke={SILVER}
            strokeOpacity="0.6"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <line
            x1="14"
            y1="102"
            x2="50"
            y2="102"
            stroke={hot ? ACCENT : SILVER}
            strokeOpacity={hot ? 1 : 0.35}
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>,
      );
    }
  }
  return (
    <>
      {cards}
      <path
        d="M 545 260 C 620 260, 650 520, 720 520"
        stroke={ACCENT}
        fill="none"
        strokeDasharray="4 6"
      />
      <g transform="translate(700 505)">
        <ellipse cx="40" cy="0" rx="40" ry="12" fill="none" stroke={SILVER} />
        <path d="M0 0 v40 a40 12 0 0 0 80 0 v-40" fill="none" stroke={SILVER} />
      </g>
    </>
  );
}

function Otp() {
  const digits = ['4', '8', '1', '9', '0', '2'];
  return (
    <>
      <circle cx="400" cy="300" r="210" fill="none" stroke={DIM} />
      <circle
        cx="400"
        cy="300"
        r="210"
        fill="none"
        stroke={ACCENT}
        strokeWidth="3"
        strokeDasharray="1320"
        strokeDashoffset="420"
        transform="rotate(-90 400 300)"
      />
      {digits.map((digit, i) => (
        <g key={i} transform={`translate(${190 + i * 72} 255)`}>
          <rect
            width="60"
            height="90"
            rx="10"
            fill="#101216"
            stroke={i === 3 ? ACCENT : SILVER}
            strokeOpacity={i === 3 ? 1 : 0.45}
          />
          <text
            x="30"
            y="60"
            textAnchor="middle"
            fontFamily="monospace"
            fontSize="40"
            fill={i === 3 ? ACCENT : '#f5f5f5'}
          >
            {digit}
          </text>
        </g>
      ))}
      <text
        x="400"
        y="400"
        textAnchor="middle"
        fontFamily="monospace"
        fontSize="14"
        letterSpacing="3"
        fill={SILVER}
        opacity="0.7"
      >
        HMAC-SHA256 · TTL 00:59
      </text>
      {[0, 1, 2, 3, 4].map((i) => (
        <rect
          key={i}
          x={250 + i * 64}
          y="440"
          width="48"
          height="6"
          rx="3"
          fill={i < 3 ? ACCENT : DIM}
        />
      ))}
    </>
  );
}

function Social() {
  const nodes = [
    [400, 300, 46],
    [210, 170, 26],
    [590, 160, 30],
    [180, 420, 22],
    [620, 440, 28],
    [400, 110, 18],
    [400, 500, 20],
    [90, 290, 14],
    [710, 300, 16],
  ];
  return (
    <>
      {nodes.slice(1).map(([x, y], i) => (
        <line
          key={`l${i}`}
          x1="400"
          y1="300"
          x2={x}
          y2={y}
          stroke={i % 3 === 0 ? ACCENT : DIM}
          strokeDasharray={i % 3 === 0 ? '0' : '3 6'}
        />
      ))}
      {nodes.map(([x, y, r], i) => (
        <g key={i}>
          <circle
            cx={x}
            cy={y}
            r={r}
            fill="#101216"
            stroke={i === 0 ? ACCENT : SILVER}
            strokeOpacity={i === 0 ? 1 : 0.6}
          />
          <circle
            cx={x}
            cy={y - r * 0.2}
            r={r * 0.3}
            fill="none"
            stroke={SILVER}
            strokeOpacity="0.5"
          />
        </g>
      ))}
      <g transform="translate(460 210)">
        <path
          d="M0 0 h150 a12 12 0 0 1 12 12 v40 a12 12 0 0 1 -12 12 h-120 l-18 16 v-16 a12 12 0 0 1 -12 -12 v-40 a12 12 0 0 1 12 -12z"
          fill={ACCENT}
          fillOpacity="0.12"
          stroke={ACCENT}
        />
        <line
          x1="18"
          y1="24"
          x2="130"
          y2="24"
          stroke={ACCENT}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="18"
          y1="42"
          x2="90"
          y2="42"
          stroke={ACCENT}
          strokeWidth="3"
          strokeLinecap="round"
          strokeOpacity="0.6"
        />
      </g>
    </>
  );
}

function Delivery() {
  const streets = [];
  for (let i = 0; i < 9; i += 1) {
    streets.push(
      <line key={`v${i}`} x1={60 + i * 85} y1="40" x2={60 + i * 85} y2="560" stroke={DIM} />,
    );
  }
  for (let i = 0; i < 7; i += 1) {
    streets.push(
      <line key={`h${i}`} x1="40" y1={60 + i * 80} x2="760" y2={60 + i * 80} stroke={DIM} />,
    );
  }
  return (
    <>
      {streets}
      <polyline
        points="145,460 145,300 315,300 315,220 485,220 485,140 655,140"
        fill="none"
        stroke={ACCENT}
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {[
        [145, 460],
        [315, 300],
        [485, 220],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="8" fill="#07080a" stroke={ACCENT} strokeWidth="3" />
      ))}
      <g transform="translate(655 140)">
        <path d="M0 0 c-24 -30 -24 -60 0 -60 c24 0 24 30 0 60z" fill={ACCENT} />
        <circle cy="-38" r="7" fill="#07080a" />
      </g>
    </>
  );
}

function Culture() {
  const arcs = [];
  for (let i = 0; i < 6; i += 1) {
    const offset = -150 + i * 60;
    arcs.push(
      <path
        key={`a${i}`}
        d={`M ${400 + offset} 100 Q 400 300 ${400 + offset} 500`}
        fill="none"
        stroke={i % 2 ? SILVER : DIM}
        strokeOpacity="0.7"
      />,
      <path
        key={`b${i}`}
        d={`M 200 ${300 + offset} Q 400 300 600 ${300 + offset}`}
        fill="none"
        stroke={i % 2 ? SILVER : DIM}
        strokeOpacity="0.7"
      />,
    );
  }
  return (
    <>
      <circle cx="400" cy="300" r="220" fill="none" stroke={SILVER} strokeOpacity="0.5" />
      <circle cx="400" cy="300" r="200" fill="none" stroke={ACCENT} strokeWidth="2" />
      <g clipPath="url(#culture-clip)">{arcs}</g>
      <defs>
        <clipPath id="culture-clip">
          <circle cx="400" cy="300" r="200" />
        </clipPath>
      </defs>
      {Array.from({ length: 24 }, (_, i) => {
        const a = (i / 24) * Math.PI * 2;
        return (
          <line
            key={`r${i}`}
            x1={round(400 + Math.cos(a) * 220)}
            y1={round(300 + Math.sin(a) * 220)}
            x2={round(400 + Math.cos(a) * 262)}
            y2={round(300 + Math.sin(a) * 262)}
            stroke={i % 6 === 0 ? ACCENT : DIM}
            strokeWidth="2"
          />
        );
      })}
    </>
  );
}

function Ai() {
  const layers = [4, 6, 6, 3];
  const positions = layers.map((count, li) =>
    Array.from({ length: count }, (_, ni) => [170 + li * 150, 300 + (ni - (count - 1) / 2) * 62]),
  );
  return (
    <>
      {positions
        .slice(0, -1)
        .map((layer, li) =>
          layer.map(([x1, y1], a) =>
            positions[li + 1].map(([x2, y2], b) => (
              <line
                key={`${li}-${a}-${b}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={(a + b + li) % 5 === 0 ? ACCENT : DIM}
                strokeOpacity={(a + b + li) % 5 === 0 ? 0.9 : 0.6}
              />
            )),
          ),
        )}
      {positions.flat().map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r="11"
          fill="#101216"
          stroke={i % 4 === 0 ? ACCENT : SILVER}
        />
      ))}
      <rect
        x="560"
        y="90"
        width="190"
        height="150"
        fill="none"
        stroke={ACCENT}
        strokeWidth="2"
        strokeDasharray="10 6"
      />
      <rect x="560" y="68" width="96" height="22" fill={ACCENT} />
      <text x="568" y="84" fontFamily="monospace" fontSize="13" fill="#07080a">
        object
      </text>
    </>
  );
}

const ARTWORKS = {
  commerce: Commerce,
  otp: Otp,
  social: Social,
  delivery: Delivery,
  culture: Culture,
  ai: Ai,
};

export default function ProjectVisual({ visual, number, filterId }) {
  const Artwork = ARTWORKS[visual] ?? Commerce;
  return (
    <svg
      viewBox="0 0 800 600"
      preserveAspectRatio="xMidYMid slice"
      width="100%"
      height="100%"
      aria-hidden="true"
    >
      <rect width="800" height="600" fill="#0c0e11" />
      <g opacity="0.35">
        {Array.from({ length: 17 }, (_, i) => (
          <line key={i} x1={i * 50} y1="0" x2={i * 50} y2="600" stroke="#1b1f26" />
        ))}
      </g>
      <g filter={filterId ? `url(#${filterId})` : undefined}>
        <Artwork />
      </g>
      <text
        x="28"
        y="572"
        fontFamily="monospace"
        fontSize="14"
        letterSpacing="4"
        fill={SILVER}
        opacity="0.55"
      >
        NK / {number}
      </text>
    </svg>
  );
}

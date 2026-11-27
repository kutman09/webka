/**
 * Particle field shaders (GLSL ES 3.0 via three.js ShaderMaterial).
 * Each particle has two homes — a shell around the core and a cell of a wide
 * undulating grid — and morphs between them with uMorph. The pointer pushes
 * particles away in world space.
 */
export const particlesVertex = /* glsl */ `
  uniform float uTime;
  uniform float uMorph;
  uniform float uSpread;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform vec3 uPointer;
  uniform float uPointerStrength;

  attribute vec3 aGrid;
  attribute vec4 aRandom;

  varying float vAlpha;
  varying float vAccent;

  void main() {
    float t = uTime;
    vec3 shell = position * (1.0 + uSpread * (0.8 + aRandom.y));
    // slow orbital drift for the shell
    float angle = t * (0.03 + aRandom.x * 0.05);
    float c = cos(angle);
    float s = sin(angle);
    shell.xz = mat2(c, -s, s, c) * shell.xz;

    vec3 grid = aGrid;
    grid.y += sin(grid.x * 0.45 + t * 0.6) * 0.28 + cos(grid.z * 0.55 + t * 0.4) * 0.22;

    float m = smoothstep(0.0, 1.0, clamp(uMorph * 1.25 - aRandom.z * 0.25, 0.0, 1.0));
    vec3 p = mix(shell, grid, m);

    p += vec3(
      sin(t * 0.35 + aRandom.x * 6.2831),
      cos(t * 0.3 + aRandom.y * 6.2831),
      sin(t * 0.25 + aRandom.z * 6.2831)
    ) * 0.06 * (0.5 + aRandom.w);

    vec4 world = modelMatrix * vec4(p, 1.0);
    vec2 away = world.xy - uPointer.xy;
    float dist = length(away);
    float push = smoothstep(1.8, 0.0, dist) * uPointerStrength;
    world.xy += normalize(away + 1e-4) * push * 0.7;

    vec4 mv = viewMatrix * world;
    gl_Position = projectionMatrix * mv;
    float size = uSize * (0.35 + aRandom.w * 0.9);
    gl_PointSize = size * uPixelRatio * (8.0 / -mv.z);

    vAlpha = (0.16 + aRandom.w * 0.5) * smoothstep(28.0, 4.0, -mv.z);
    vAccent = step(0.965, aRandom.x) + push * 0.6;
  }
`;

export const particlesFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uAccent;
  uniform float uOpacity;

  varying float vAlpha;
  varying float vAccent;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    float disc = smoothstep(0.5, 0.15, d);
    if (disc < 0.01) discard;
    vec3 color = mix(uColor, uAccent, clamp(vAccent, 0.0, 1.0));
    gl_FragColor = vec4(color, disc * vAlpha * uOpacity);
  }
`;

/** Energy core: fresnel rim + animated noise bands, emissive > 1 so only it blooms. */
export const coreVertex = /* glsl */ `
  uniform float uTime;
  uniform float uEnergy;
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vPos;

  void main() {
    vec3 p = position;
    float wobble = sin(p.x * 4.0 + uTime * 1.3) * sin(p.y * 3.0 + uTime * 1.1) * sin(p.z * 5.0 + uTime * 0.9);
    p += normal * wobble * 0.04 * (0.5 + uEnergy);
    vec4 world = modelMatrix * vec4(p, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-(viewMatrix * world).xyz);
    vPos = p;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

export const coreFragment = /* glsl */ `
  uniform float uTime;
  uniform float uEnergy;
  uniform vec3 uColor;
  uniform vec3 uHot;
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vPos;

  void main() {
    float fresnel = pow(1.0 - max(dot(normalize(vNormal), normalize(vView)), 0.0), 2.2);
    float bands = sin(vPos.y * 18.0 - uTime * 2.2) * 0.5 + 0.5;
    bands = smoothstep(0.75, 1.0, bands) * 0.6;
    float pulse = 0.85 + sin(uTime * 1.6) * 0.15;
    vec3 base = mix(uColor * 0.25, uColor, bands);
    vec3 color = base + uHot * fresnel * (0.9 + uEnergy * 0.9) * pulse;
    gl_FragColor = vec4(color * (0.45 + uEnergy * 0.5), 1.0);
  }
`;

/** Neural links: per-vertex phase drives a travelling pulse along each segment. */
export const linksVertex = /* glsl */ `
  attribute float aPhase;
  attribute float aProgress;
  varying float vPhase;
  varying float vProgress;
  void main() {
    vPhase = aPhase;
    vProgress = aProgress;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const linksFragment = /* glsl */ `
  uniform float uTime;
  uniform float uOpacity;
  uniform vec3 uColor;
  uniform vec3 uAccent;
  varying float vPhase;
  varying float vProgress;
  void main() {
    float head = fract(uTime * 0.25 + vPhase);
    float pulse = smoothstep(0.12, 0.0, abs(vProgress - head));
    vec3 color = mix(uColor, uAccent * 1.3, pulse);
    gl_FragColor = vec4(color, (0.12 + pulse * 0.9) * uOpacity);
  }
`;

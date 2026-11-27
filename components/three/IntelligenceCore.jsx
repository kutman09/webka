'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  AdditiveBlending,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Color,
  CylinderGeometry,
  IcosahedronGeometry,
  MathUtils,
  Matrix4,
  MeshPhysicalMaterial,
  Object3D,
  Quaternion,
  ShaderMaterial,
  SphereGeometry,
  TorusGeometry,
  Vector3,
} from 'three';
import { coreFragment, coreVertex, linksFragment, linksVertex } from '@/shaders/particles';
import { NK_JOINT, NK_SEGMENTS } from '@/lib/nkMark';
import SkillsUniverse from './SkillsUniverse';
import { live } from './live';

const ACCENT = new Color('#b8ff36');
const SILVER = new Color('#c7ccd5');
const SHELL_RADIUS = 1.22;

/* ---------- procedural geometry helpers (pure, memoised once) ---------- */

function icosahedronFrame(radius) {
  const source = new IcosahedronGeometry(radius, 0);
  const position = source.getAttribute('position');
  const vertices = [];
  for (let i = 0; i < position.count; i += 1) {
    const v = new Vector3().fromBufferAttribute(position, i);
    if (!vertices.some((existing) => existing.distanceTo(v) < 1e-4)) vertices.push(v);
  }
  source.dispose();
  let edgeLength = Infinity;
  for (let i = 1; i < vertices.length; i += 1)
    edgeLength = Math.min(edgeLength, vertices[0].distanceTo(vertices[i]));
  const edges = [];
  for (let i = 0; i < vertices.length; i += 1) {
    for (let j = i + 1; j < vertices.length; j += 1) {
      if (Math.abs(vertices[i].distanceTo(vertices[j]) - edgeLength) < 1e-3)
        edges.push([vertices[i], vertices[j]]);
    }
  }
  return { vertices, edges };
}

function beamMatrix(a, b, thickness = 1) {
  const up = new Vector3(0, 1, 0);
  const direction = new Vector3().subVectors(b, a);
  const length = direction.length();
  const quaternion = new Quaternion().setFromUnitVectors(up, direction.normalize());
  const middle = new Vector3().addVectors(a, b).multiplyScalar(0.5);
  return new Matrix4().compose(middle, quaternion, new Vector3(thickness, length, thickness));
}

function neuralLinks(count, seed = 7) {
  let s = seed;
  const random = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  const points = Array.from({ length: count }, () => {
    const v = new Vector3(random() * 2 - 1, random() * 2 - 1, random() * 2 - 1).normalize();
    return v.multiplyScalar(1.35 + random() * 0.75);
  });
  const positions = [];
  const phase = [];
  const progress = [];
  points.forEach((point, index) => {
    const nearest = points
      .map((other, j) => ({ j, d: other.distanceTo(point) }))
      .filter(({ j }) => j !== index)
      .sort((x, y) => x.d - y.d)
      .slice(0, 2);
    nearest.forEach(({ j }) => {
      const other = points[j];
      const p = random();
      positions.push(point.x, point.y, point.z, other.x, other.y, other.z);
      phase.push(p, p);
      progress.push(0, 1);
    });
  });
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
  geometry.setAttribute('aPhase', new BufferAttribute(new Float32Array(phase), 1));
  geometry.setAttribute('aProgress', new BufferAttribute(new Float32Array(progress), 1));
  return geometry;
}

function polarGrid(radius = 3.4, rings = 5, spokes = 36) {
  const positions = [];
  for (let r = 1; r <= rings; r += 1) {
    const rr = (radius * r) / rings;
    const segments = 96;
    for (let i = 0; i < segments; i += 1) {
      const a0 = (i / segments) * Math.PI * 2;
      const a1 = ((i + 1) / segments) * Math.PI * 2;
      positions.push(
        Math.cos(a0) * rr,
        0,
        Math.sin(a0) * rr,
        Math.cos(a1) * rr,
        0,
        Math.sin(a1) * rr,
      );
    }
  }
  for (let i = 0; i < spokes; i += 1) {
    const a = (i / spokes) * Math.PI * 2;
    const inner = radius / rings;
    positions.push(
      Math.cos(a) * inner,
      0,
      Math.sin(a) * inner,
      Math.cos(a) * radius,
      0,
      Math.sin(a) * radius,
    );
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
  return geometry;
}

const RINGS = [
  { radius: 1.58, tube: 0.016, tilt: [1.2, 0.2, 0], speed: 0.16, spread: 0.5 },
  { radius: 1.78, tube: 0.028, tilt: [0.4, 1.1, 0.3], speed: -0.11, spread: 0.85 },
  { radius: 1.98, tube: 0.012, tilt: [-0.7, 0.3, 1.2], speed: 0.08, spread: 1.2 },
  { radius: 2.22, tube: 0.02, tilt: [1.57, 0, 0.45], speed: -0.06, spread: 1.6 },
];

/* ---------- component ---------- */

/**
 * THE INTELLIGENCE CORE — fully procedural: an emissive shader core, a chrome
 * icosahedral cage (instanced struts + nodes), interlaced chrome rings, a ring of
 * instanced data blocks, travelling neural links, a polar grid and the NK monogram
 * that takes over when the scene becomes the technology universe.
 */
export default function IntelligenceCore({ preset, reduced = false, showUniverse = true }) {
  const anchor = useRef(null);
  const rotator = useRef(null);
  const shell = useRef(null);
  const core = useRef(null);
  const rings = useRef([]);
  const data = useRef(null);
  const monogram = useRef(null);
  const grid = useRef(null);
  const innerLight = useRef(null);
  const pointerLight = useRef(null);
  const time = useRef(0);

  const detail = preset.segments >= 1 ? 5 : preset.segments >= 0.75 ? 4 : 3;
  const tubularSegments = Math.round(160 * preset.segments);

  const resources = useMemo(() => {
    const frame = icosahedronFrame(SHELL_RADIUS);
    const chrome = new MeshPhysicalMaterial({
      color: SILVER,
      metalness: 1,
      roughness: 0.16,
      clearcoat: 1,
      clearcoatRoughness: 0.12,
      envMapIntensity: 1.35,
    });
    const darkChrome = new MeshPhysicalMaterial({
      color: new Color('#5d636e'),
      metalness: 1,
      roughness: 0.28,
      envMapIntensity: 1.1,
    });
    const coreMaterial = new ShaderMaterial({
      vertexShader: coreVertex,
      fragmentShader: coreFragment,
      uniforms: {
        uTime: { value: 0 },
        uEnergy: { value: 0.7 },
        uColor: { value: ACCENT.clone() },
        uHot: { value: new Color('#e9ffc2') },
      },
    });
    const linksMaterial = new ShaderMaterial({
      vertexShader: linksVertex,
      fragmentShader: linksFragment,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uOpacity: { value: 1 },
        uColor: { value: new Color('#3c414b') },
        uAccent: { value: ACCENT.clone() },
      },
    });
    const dataMaterial = new MeshPhysicalMaterial({
      color: SILVER,
      metalness: 0.9,
      roughness: 0.25,
      envMapIntensity: 1.2,
    });
    const glowMaterial = new MeshPhysicalMaterial({
      color: ACCENT,
      emissive: ACCENT,
      emissiveIntensity: 1.7,
      toneMapped: false,
    });
    return {
      frame,
      chrome,
      darkChrome,
      coreMaterial,
      linksMaterial,
      dataMaterial,
      glowMaterial,
      strut: new CylinderGeometry(0.014, 0.014, 1, 6, 1),
      node: new SphereGeometry(0.045, 12, 12),
      coreGeometry: new IcosahedronGeometry(0.5, detail),
      ringGeometries: RINGS.map(
        (ring) => new TorusGeometry(ring.radius, ring.tube, 12, tubularSegments),
      ),
      block: new BoxGeometry(0.06, 0.06, 0.16),
      beam: new BoxGeometry(1, 1, 1),
      links: neuralLinks(Math.round(42 * preset.segments) + 10),
      grid: polarGrid(),
    };
  }, [detail, tubularSegments, preset.segments]);

  // dispose GPU resources on unmount / quality change
  useEffect(
    () => () => {
      Object.values(resources).forEach((resource) => {
        if (Array.isArray(resource)) resource.forEach((item) => item.dispose?.());
        else resource?.dispose?.();
      });
    },
    [resources],
  );

  // instanced struts and nodes of the cage
  const strutsRef = useRef(null);
  const nodesRef = useRef(null);
  useEffect(() => {
    const { edges, vertices } = resources.frame;
    edges.forEach(([a, b], i) => strutsRef.current?.setMatrixAt(i, beamMatrix(a, b)));
    const dummy = new Object3D();
    vertices.forEach((v, i) => {
      dummy.position.copy(v);
      dummy.updateMatrix();
      nodesRef.current?.setMatrixAt(i, dummy.matrix);
    });
    if (strutsRef.current) strutsRef.current.instanceMatrix.needsUpdate = true;
    if (nodesRef.current) nodesRef.current.instanceMatrix.needsUpdate = true;
  }, [resources]);

  // instanced data blocks on an outer "digital" ring
  const blockCount = preset.instances;
  const blockSeeds = useMemo(
    () =>
      Array.from({ length: blockCount }, (_, i) => ({
        angle: (i / blockCount) * Math.PI * 2,
        lift: Math.sin(i * 12.9898) * 0.06,
        lit: i % 7 === 0,
      })),
    [blockCount],
  );

  // NK monogram beams mapped from the 48×40 logo box
  const monogramBeams = useMemo(() => {
    const map = (x, y) => new Vector3(((x - 24) / 20) * 0.62, (-(y - 20) / 20) * 0.62, 0);
    return NK_SEGMENTS.map(([x1, y1, x2, y2]) => beamMatrix(map(x1, y1), map(x2, y2), 0.075));
  }, []);
  const jointPosition = useMemo(
    () => [((NK_JOINT[0] - 24) / 20) * 0.62, (-(NK_JOINT[1] - 20) / 20) * 0.62, 0],
    [],
  );
  const monogramRef = useRef(null);
  useEffect(() => {
    monogramBeams.forEach((matrix, i) => monogramRef.current?.setMatrixAt(i, matrix));
    if (monogramRef.current) monogramRef.current.instanceMatrix.needsUpdate = true;
  }, [monogramBeams]);

  const litCount = blockSeeds.filter((seed) => seed.lit).length;
  const plainCount = blockCount - litCount;
  const blocksRef = useRef(null);
  const litBlocksRef = useRef(null);
  const dummy = useMemo(() => new Object3D(), []);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 20);
    time.current += reduced ? 0 : dt;
    const t = time.current;

    // placement from the scroll timeline
    anchor.current.position.set(live.coreX, live.coreY, live.coreZ);
    anchor.current.scale.setScalar(live.scale);

    // idle spin + pointer follow
    rotator.current.rotation.y = t * 0.12 + live.yaw + live.pointerX * 0.5;
    rotator.current.rotation.x = Math.sin(t * 0.2) * 0.08 - live.pointerY * 0.35;

    // energy core
    const nkHide = 1 - live.nk;
    const breathe = 1 + Math.sin(t * 1.6) * 0.035;
    core.current.scale.setScalar(
      Math.max(
        0.0001,
        (0.55 + nkHide * 0.45) * (1 - live.nk * 0.92) * breathe * (1 + live.spread * 0.25),
      ),
    );
    core.current.visible = live.nk < 0.98;
    resources.coreMaterial.uniforms.uTime.value = t;
    resources.coreMaterial.uniforms.uEnergy.value = live.energy;

    // chrome cage
    const shellScale = live.shell * (1 + live.spread * 0.35);
    shell.current.scale.setScalar(Math.max(0.0001, shellScale));
    shell.current.visible = live.shell > 0.01;
    shell.current.rotation.y = -t * 0.18;
    shell.current.rotation.z = t * 0.07;

    // interlaced rings separate with scroll
    rings.current.forEach((ring, i) => {
      if (!ring) return;
      const cfg = RINGS[i];
      const spread = live.spread * cfg.spread;
      ring.scale.setScalar(Math.max(0.0001, (1 + spread * 0.55) * (1 - live.nk * 0.7)));
      ring.visible = live.nk < 0.9;
      ring.rotation.set(
        cfg.tilt[0] + spread * 0.6,
        cfg.tilt[1] + t * cfg.speed,
        cfg.tilt[2] + spread * 0.4 * (i % 2 ? -1 : 1),
      );
    });

    // data block ring (plain chrome blocks + a few lit ones that bloom)
    if (data.current && blocksRef.current && litBlocksRef.current) {
      const radius = 2.62 + live.spread * 1.4;
      let plain = 0;
      let lit = 0;
      blockSeeds.forEach((seed) => {
        const angle = seed.angle + t * 0.09;
        dummy.position.set(
          Math.cos(angle) * radius,
          seed.lift + Math.sin(angle * 3 + t) * 0.05 * (1 + live.spread),
          Math.sin(angle) * radius,
        );
        dummy.rotation.set(0, -angle, 0);
        dummy.scale.set(1, 1, 1 + live.spread);
        dummy.updateMatrix();
        if (seed.lit) litBlocksRef.current.setMatrixAt(lit++, dummy.matrix);
        else blocksRef.current.setMatrixAt(plain++, dummy.matrix);
      });
      blocksRef.current.instanceMatrix.needsUpdate = true;
      litBlocksRef.current.instanceMatrix.needsUpdate = true;
      data.current.rotation.x = 0.32 + live.pointerY * 0.1;
      data.current.visible = live.nk < 0.95;
    }

    // neural links
    resources.linksMaterial.uniforms.uTime.value = t;
    resources.linksMaterial.uniforms.uOpacity.value = (0.5 + live.energy * 0.5) * (1 - live.nk);

    // monogram
    const nkScale = MathUtils.smoothstep(live.nk, 0.1, 1);
    monogram.current.scale.setScalar(Math.max(0.0001, nkScale));
    monogram.current.visible = nkScale > 0.01;
    monogram.current.rotation.y = Math.sin(t * 0.4) * 0.35 + live.pointerX * 0.4;

    grid.current.material.opacity = 0.14 * live.shell * (live.portrait ? 0.25 : 1);
    grid.current.position.y = -2.1 - live.spread * 0.6;

    innerLight.current.intensity = 6 + live.energy * 10;
    pointerLight.current.position.set(live.pointerX * 6, live.pointerY * 4 + 1, 4);
  });

  return (
    <>
      <pointLight ref={pointerLight} color="#ffffff" intensity={18} distance={14} decay={1.6} />
      <group ref={anchor}>
        <group ref={rotator}>
          <pointLight ref={innerLight} color={ACCENT} intensity={10} distance={5} decay={1.4} />
          <mesh ref={core} geometry={resources.coreGeometry} material={resources.coreMaterial} />

          <group ref={shell}>
            <instancedMesh
              ref={strutsRef}
              args={[resources.strut, resources.chrome, resources.frame.edges.length]}
            />
            <instancedMesh
              ref={nodesRef}
              args={[resources.node, resources.chrome, resources.frame.vertices.length]}
            />
          </group>

          {RINGS.map((ring, i) => (
            <mesh
              key={ring.radius}
              ref={(node) => {
                rings.current[i] = node;
              }}
              geometry={resources.ringGeometries[i]}
              material={i === 1 ? resources.darkChrome : resources.chrome}
            />
          ))}

          <lineSegments geometry={resources.links} material={resources.linksMaterial} />

          <group ref={data}>
            <instancedMesh
              ref={blocksRef}
              args={[resources.block, resources.dataMaterial, plainCount]}
            />
            <instancedMesh
              ref={litBlocksRef}
              args={[resources.block, resources.glowMaterial, litCount]}
            />
          </group>

          <group ref={monogram}>
            <instancedMesh
              ref={monogramRef}
              args={[resources.beam, resources.chrome, monogramBeams.length]}
            />
            <mesh position={jointPosition} material={resources.glowMaterial}>
              <boxGeometry args={[0.12, 0.12, 0.12]} />
            </mesh>
          </group>
        </group>

        <lineSegments ref={grid} geometry={resources.grid}>
          <lineBasicMaterial color={SILVER} transparent opacity={0.14} depthWrite={false} />
        </lineSegments>

        {showUniverse && <SkillsUniverse reduced={reduced} />}
      </group>
    </>
  );
}

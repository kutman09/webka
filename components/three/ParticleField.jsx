'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  ShaderMaterial,
  Vector3,
} from 'three';
import { particlesFragment, particlesVertex } from '@/shaders/particles';
import { sceneStore } from '@/lib/sceneStore';
import { live } from './live';

const unprojected = new Vector3();
const direction = new Vector3();

function buildGeometry(count) {
  const shell = new Float32Array(count * 3);
  const grid = new Float32Array(count * 3);
  const random = new Float32Array(count * 4);
  const columns = Math.ceil(Math.sqrt(count * 1.8));
  const rows = Math.ceil(count / columns);

  for (let i = 0; i < count; i += 1) {
    // shell: denser close to the core, sparse far away
    const u = Math.random() * 2 - 1;
    const theta = Math.random() * Math.PI * 2;
    const radius = 2.1 + Math.pow(Math.random(), 1.6) * 6.5;
    const r = Math.sqrt(1 - u * u);
    shell.set(
      [Math.cos(theta) * r * radius, u * radius * 0.7, Math.sin(theta) * r * radius],
      i * 3,
    );

    // grid: a wide undulating floor that becomes the "new space"
    const cx = i % columns;
    const cz = Math.floor(i / columns);
    grid.set(
      [
        (cx / (columns - 1) - 0.5) * 34 + (Math.random() - 0.5) * 0.08,
        -2.8,
        (cz / Math.max(rows - 1, 1)) * -22 + 4,
      ],
      i * 3,
    );

    random.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4);
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(shell, 3));
  geometry.setAttribute('aGrid', new BufferAttribute(grid, 3));
  geometry.setAttribute('aRandom', new BufferAttribute(random, 4));
  return geometry;
}

/** GPU particle field: thousands of points, one draw call, all motion in the vertex shader. */
export default function ParticleField({ count = 3000, reduced = false }) {
  const points = useRef(null);
  const time = useRef(0);
  const camera = useThree((state) => state.camera);
  const dpr = useThree((state) => state.viewport.dpr);

  const geometry = useMemo(() => buildGeometry(count), [count]);
  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: particlesVertex,
        fragmentShader: particlesFragment,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uMorph: { value: 0 },
          uSpread: { value: 0 },
          uSize: { value: 4.6 },
          uPixelRatio: { value: 1 },
          uPointer: { value: new Vector3(99, 99, 0) },
          uPointerStrength: { value: 0 },
          uColor: { value: new Color('#c7ccd5') },
          uAccent: { value: new Color('#b8ff36') },
          uOpacity: { value: 0.9 },
        },
      }),
    [],
  );

  useEffect(
    () => () => {
      geometry.dispose();
    },
    [geometry],
  );
  useEffect(() => () => material.dispose(), [material]);

  useFrame((_, delta) => {
    time.current += reduced ? 0 : Math.min(delta, 1 / 20);
    const u = material.uniforms;
    u.uTime.value = time.current;
    u.uMorph.value = live.morph;
    u.uSpread.value = live.pSpread;
    u.uPixelRatio.value = dpr;

    // pointer → world position on the z = 0 plane
    const { pointer } = sceneStore.get();
    unprojected.set(pointer.x, pointer.y, 0.5).unproject(camera);
    direction.subVectors(unprojected, camera.position).normalize();
    const distance = -camera.position.z / direction.z;
    u.uPointer.value.copy(camera.position).addScaledVector(direction, distance);
    u.uPointerStrength.value = reduced ? 0 : 1;

    // the shell surrounds the core; the grid stays anchored to the world
    const follow = 1 - live.morph;
    points.current.position.set(live.coreX * follow, live.coreY * follow, live.coreZ * follow);
  });

  return <points ref={points} geometry={geometry} material={material} frustumCulled={false} />;
}

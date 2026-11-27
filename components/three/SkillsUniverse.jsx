'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  LineBasicMaterial,
  MathUtils,
  MeshStandardMaterial,
  SphereGeometry,
} from 'three';
import { skillCategories } from '@/data/skills';
import { useSceneValue } from '@/lib/sceneStore';
import { live } from './live';
import styles from './SkillsUniverse.module.css';

const ACCENT = new Color('#b8ff36');
const DIM = new Color('#6d7380');

export const ORBITS = skillCategories.map((category, index) => ({
  ...category,
  radius: 1.45 + index * 0.5,
  tilt: [1.18 + (index % 2 ? 0.1 : -0.06), 0, (index - 2.5) * 0.07],
  speed: 0.05 + (index % 3) * 0.02,
}));

function circle(radius, segments = 160) {
  const positions = new Float32Array((segments + 1) * 3);
  for (let i = 0; i <= segments; i += 1) {
    const a = (i / segments) * Math.PI * 2;
    positions.set([Math.cos(a) * radius, 0, Math.sin(a) * radius], i * 3);
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  return geometry;
}

function Orbit({ orbit, index, reduced, showLabels }) {
  const spin = useRef(null);
  const tilt = useRef(null);
  const nodes = useRef([]);
  const emphasis = useRef(0);

  const { geometry, lineMaterial, nodeMaterial, nodeGeometry } = useMemo(
    () => ({
      geometry: circle(orbit.radius),
      lineMaterial: new LineBasicMaterial({
        color: DIM,
        transparent: true,
        opacity: 0.2,
        depthWrite: false,
      }),
      nodeMaterial: new MeshStandardMaterial({
        color: '#c7ccd5',
        metalness: 0.8,
        roughness: 0.25,
        emissive: ACCENT,
        emissiveIntensity: 0,
        toneMapped: false,
      }),
      nodeGeometry: new SphereGeometry(0.055, 16, 16),
    }),
    [orbit.radius],
  );

  useEffect(
    () => () => {
      geometry.dispose();
      lineMaterial.dispose();
      nodeMaterial.dispose();
      nodeGeometry.dispose();
    },
    [geometry, lineMaterial, nodeMaterial, nodeGeometry],
  );

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 20);
    const active = live.skillIndex === index ? 1 : 0;
    emphasis.current = MathUtils.damp(emphasis.current, active, 5, dt);
    const e = emphasis.current;
    spin.current.rotation.y += reduced ? 0 : dt * orbit.speed * (1 - e * 0.6);
    tilt.current.scale.setScalar(1 + e * 0.12);
    lineMaterial.opacity = (0.14 + e * 0.7) * live.universe;
    lineMaterial.color.copy(DIM).lerp(ACCENT, e);
    nodeMaterial.emissiveIntensity = e * 2.4;
    nodes.current.forEach((node) =>
      node?.scale.setScalar((1 + e * 0.9) * Math.max(live.universe, 0.0001)),
    );
  });

  const count = orbit.items.length;

  return (
    <group ref={tilt} rotation={orbit.tilt}>
      <lineLoop geometry={geometry} material={lineMaterial} />
      <group ref={spin} rotation={[0, index * 0.9, 0]}>
        {orbit.items.map((item, i) => {
          const angle = (i / count) * Math.PI * 2;
          const position = [Math.cos(angle) * orbit.radius, 0, Math.sin(angle) * orbit.radius];
          return (
            <group key={item} position={position}>
              <mesh
                ref={(node) => {
                  nodes.current[i] = node;
                }}
                geometry={nodeGeometry}
                material={nodeMaterial}
              />
              {showLabels && (
                <Html center zIndexRange={[5, 0]} className={styles.labelWrap} aria-hidden="true">
                  <span className={styles.label}>{item}</span>
                </Html>
              )}
            </group>
          );
        })}
      </group>
    </group>
  );
}

/**
 * Six tilted orbits around the NK nucleus. The selected category (chosen with
 * normal HTML buttons in the Skills section) brightens, grows and gets labels,
 * while the camera moves closer (see CameraController).
 */
export default function SkillsUniverse({ reduced = false }) {
  const group = useRef(null);
  const activeSkill = useSceneValue('activeSkill');
  const universeOn = useSceneValue('universeOn');

  useFrame(() => {
    const u = live.universe;
    group.current.visible = u > 0.01;
    group.current.scale.setScalar(Math.max(0.0001, 0.6 + u * 0.4));
    group.current.rotation.x = live.pointerY * 0.15;
    group.current.rotation.y = live.pointerX * 0.25;
  });

  return (
    <group ref={group}>
      {ORBITS.map((orbit, index) => (
        <Orbit
          key={orbit.id}
          orbit={orbit}
          index={index}
          reduced={reduced}
          showLabels={universeOn && orbit.id === activeSkill}
        />
      ))}
    </group>
  );
}

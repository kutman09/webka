'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  LineBasicMaterial,
  MathUtils,
  MeshBasicMaterial,
  Object3D,
  SphereGeometry,
} from 'three';

const SILVER = new Color('#8a909b');
const ACCENT = new Color('#b8ff36');
const MAX_PULSES = 160;
const dummy = new Object3D();
const tmpColor = new Color();

function buildLayout(hidden, neurons) {
  const sizes = [4, ...Array.from({ length: hidden }, () => neurons), 2];
  const layers = sizes.map((count, li) => {
    const x = MathUtils.lerp(-3.3, 3.3, li / (sizes.length - 1));
    const spacing = Math.min(0.62, 3.6 / Math.max(count - 1, 1));
    return Array.from({ length: count }, (_, ni) => ({
      x,
      y: (ni - (count - 1) / 2) * spacing,
      z: Math.sin(li * 1.7 + ni) * 0.25,
    }));
  });
  const flat = layers.flat();
  const offsets = [];
  let acc = 0;
  layers.forEach((layer) => {
    offsets.push(acc);
    acc += layer.length;
  });
  return { layers, flat, offsets };
}

/**
 * Demonstration of signals travelling through a feed-forward network.
 * Not a trained model: activations are illustrative, pulses pick random paths.
 */
export default function NeuralNetwork({
  hidden = 2,
  neurons = 6,
  speed = 1,
  fireToken = 0,
  reduced = false,
}) {
  const group = useRef(null);
  const neuronMesh = useRef(null);
  const pulseMesh = useRef(null);
  const activation = useRef([]);
  const pulses = useRef([]);
  const lastAuto = useRef(0);
  const elapsed = useRef(0);

  const layout = useMemo(() => buildLayout(hidden, neurons), [hidden, neurons]);
  // fit the whole network into narrow (mobile) canvases
  const viewportWidth = useThree((state) => state.viewport.width);
  const fit = Math.min(1, viewportWidth / 7.8);

  const resources = useMemo(() => {
    const positions = [];
    layout.layers.slice(0, -1).forEach((layer, li) => {
      layer.forEach((a) => {
        layout.layers[li + 1].forEach((b) => positions.push(a.x, a.y, a.z, b.x, b.y, b.z));
      });
    });
    const lines = new BufferGeometry();
    lines.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
    return {
      lines,
      lineMaterial: new LineBasicMaterial({
        color: '#3b414b',
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
      }),
      neuronGeometry: new SphereGeometry(0.1, 20, 20),
      neuronMaterial: new MeshBasicMaterial({ color: '#ffffff' }),
      pulseGeometry: new SphereGeometry(0.065, 12, 12),
      pulseMaterial: new MeshBasicMaterial({
        color: ACCENT,
        blending: AdditiveBlending,
        transparent: true,
        depthWrite: false,
      }),
    };
  }, [layout]);

  useEffect(() => {
    activation.current = new Array(layout.flat.length).fill(0);
    pulses.current = [];
    return () => Object.values(resources).forEach((resource) => resource.dispose());
  }, [layout, resources]);

  const spawn = (layerIndex, neuronIndex) => {
    if (layerIndex >= layout.layers.length - 1) return;
    const next = layout.layers[layerIndex + 1];
    const fanOut = layerIndex === 0 ? 2 : 1 + Math.round(Math.random());
    for (let k = 0; k < fanOut; k += 1) {
      if (pulses.current.length >= MAX_PULSES) return;
      pulses.current.push({
        layer: layerIndex,
        from: neuronIndex,
        to: Math.floor(Math.random() * next.length),
        progress: 0,
      });
    }
  };

  const fire = (all = false) => {
    const inputs = layout.layers[0];
    inputs.forEach((_, ni) => {
      if (all || Math.random() > 0.5) {
        activation.current[ni] = 1;
        spawn(0, ni);
      }
    });
  };

  // "Fire signal" button
  useEffect(() => {
    if (fireToken > 0) fire(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fire only when the token changes
  }, [fireToken]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 20);
    elapsed.current += dt;

    if (!reduced && elapsed.current - lastAuto.current > 1.8 / speed) {
      lastAuto.current = elapsed.current;
      fire(false);
    }

    // advance pulses
    const arrived = [];
    pulses.current = pulses.current.filter((pulse) => {
      pulse.progress += dt * 1.1 * speed;
      if (pulse.progress >= 1) {
        arrived.push(pulse);
        return false;
      }
      return true;
    });
    arrived.forEach((pulse) => {
      const target = layout.offsets[pulse.layer + 1] + pulse.to;
      activation.current[target] = 1;
      spawn(pulse.layer + 1, pulse.to);
    });

    // neurons: decay activation, colour + scale
    if (neuronMesh.current) {
      layout.flat.forEach((neuron, i) => {
        activation.current[i] = Math.max(0, (activation.current[i] ?? 0) - dt * 1.4);
        const a = activation.current[i];
        dummy.position.set(neuron.x, neuron.y, neuron.z);
        dummy.scale.setScalar(1 + a * 0.7);
        dummy.updateMatrix();
        neuronMesh.current.setMatrixAt(i, dummy.matrix);
        neuronMesh.current.setColorAt(i, tmpColor.copy(SILVER).lerp(ACCENT, a));
      });
      neuronMesh.current.instanceMatrix.needsUpdate = true;
      if (neuronMesh.current.instanceColor) neuronMesh.current.instanceColor.needsUpdate = true;
    }

    // pulses
    if (pulseMesh.current) {
      for (let i = 0; i < MAX_PULSES; i += 1) {
        const pulse = pulses.current[i];
        if (pulse) {
          const a = layout.layers[pulse.layer][pulse.from];
          const b = layout.layers[pulse.layer + 1][pulse.to];
          const p = pulse.progress;
          dummy.position.set(
            MathUtils.lerp(a.x, b.x, p),
            MathUtils.lerp(a.y, b.y, p),
            MathUtils.lerp(a.z, b.z, p),
          );
          dummy.scale.setScalar(1);
        } else {
          dummy.position.set(0, 0, -100);
          dummy.scale.setScalar(0);
        }
        dummy.updateMatrix();
        pulseMesh.current.setMatrixAt(i, dummy.matrix);
      }
      pulseMesh.current.instanceMatrix.needsUpdate = true;
    }

    // gentle tilt towards the pointer over the canvas
    if (group.current) {
      const tx = reduced ? 0 : state.pointer.x * 0.35;
      const ty = reduced ? 0 : -state.pointer.y * 0.25;
      group.current.rotation.y = MathUtils.damp(group.current.rotation.y, tx, 3, dt);
      group.current.rotation.x = MathUtils.damp(group.current.rotation.x, ty, 3, dt);
    }
  });

  return (
    <group ref={group} scale={fit}>
      <lineSegments geometry={resources.lines} material={resources.lineMaterial} />
      <instancedMesh
        key={`n-${layout.flat.length}`}
        ref={neuronMesh}
        args={[resources.neuronGeometry, resources.neuronMaterial, layout.flat.length]}
      />
      <instancedMesh
        ref={pulseMesh}
        args={[resources.pulseGeometry, resources.pulseMaterial, MAX_PULSES]}
        frustumCulled={false}
      />
    </group>
  );
}

import nextVitals from 'eslint-config-next/core-web-vitals';

const config = [
  ...nextVitals,
  {
    ignores: ['.next/**', 'node_modules/**', 'playwright-report/**', 'test-results/**'],
  },
  {
    rules: {
      // R3F intrinsic elements (mesh, instancedMesh, args, …) are not DOM properties
      'react/no-unknown-property': 'off',
    },
  },
  {
    // Inside useFrame three.js objects (materials, uniforms) are mutated every frame by design.
    files: ['components/three/**/*.jsx'],
    rules: {
      'react-hooks/immutability': 'off',
    },
  },
];

export default config;

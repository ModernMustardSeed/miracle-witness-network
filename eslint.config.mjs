import coreWebVitals from 'eslint-config-next/core-web-vitals';
import typescript from 'eslint-config-next/typescript';

/**
 * eslint-config-next 16 ships flat config arrays, so there is no FlatCompat
 * layer here. Rule overrides deliberately live nowhere else: in flat config a
 * plugin resolves per config object, and an override written beside the spread
 * fails to find the plugin the spread registered.
 */
const config = [
  { ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts', 'public/**'] },
  ...coreWebVitals,
  ...typescript,
];

export default config;

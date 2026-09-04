import { defineConfig } from 'tsdown';
import nodePolyfills from '@rolldown/plugin-node-polyfills';

export default defineConfig({
  entry: ['index.ts'],
  format: ['esm', 'cjs', 'umd'],
  outDir: 'dist',
  clean: true,
  dts: true,
  sourcemap: true,
  // Use fixedExtension so CJS gets .cjs, ESM gets .mjs, UMD gets .umd.js
  // — avoids filename collisions between formats.
  fixedExtension: true,
  // iconv-lite is a CJS package without ESM named exports.
  // Bundle it into ESM and UMD so consumers don't hit CJS-interop issues.
  // For CJS it stays external (Node's require() handles it natively).
  deps: {
    alwaysBundle: ['iconv-lite'],
    onlyBundle: false
  },
  // UMD needs a global variable name for browser usage.
  outputOptions(outputOptions, format) {
    if (format === 'umd') {
      return { ...outputOptions, name: 'tsShapefile' };
    }
    return outputOptions;
  },
  // For CJS, keep iconv-lite external. For UMD, polyfill Node builtins (Buffer).
  inputOptions(options, format) {
    const opts = { ...options };
    if (format === 'cjs') {
      opts.external = ['iconv-lite'];
    } else if (format === 'umd') {
      opts.plugins = [...(opts.plugins ?? []), nodePolyfills()];
    }
    return opts;
  }
});

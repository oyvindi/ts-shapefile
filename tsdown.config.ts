import { defineConfig } from 'tsdown';
import nodePolyfills from '@rolldown/plugin-node-polyfills';

export default defineConfig({
  entry: ['index.ts', 'node.ts'],
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
  // UMD is browser-only and does not support code-splitting, so only build
  // the browser entry (index.ts). The ./node entry is Node-only and has no
  // browser export condition, so it is emitted for ESM and CJS only.
  format: {
    esm: {},
    cjs: {},
    umd: {
      entry: ['index.ts']
    }
  },
  // UMD needs a global variable name for browser usage.
  outputOptions(outputOptions, format) {
    if (format === 'umd') {
      return { ...outputOptions, name: 'tsShapefile' };
    }
    return outputOptions;
  },
  // For CJS, keep iconv-lite external. For UMD, polyfill Node builtins (Buffer).
  // node:fs/promises and node:path are Node-only builtins used by the ./node
  // entry; keep them external for ESM and CJS.
  inputOptions(options, format) {
    const opts = { ...options };
    const nodeBuiltins = ['node:fs/promises', 'node:path'];
    if (format === 'cjs') {
      opts.external = ['iconv-lite', ...nodeBuiltins];
    } else if (format === 'esm') {
      opts.external = [...(opts.external ?? []), ...nodeBuiltins];
    } else if (format === 'umd') {
      opts.plugins = [...(opts.plugins ?? []), nodePolyfills()];
    }
    return opts;
  }
});

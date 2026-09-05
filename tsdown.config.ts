import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['index.ts', 'node.ts'],
  outDir: 'dist',
  clean: true,
  dts: true,
  minify: true,
  sourcemap: true,
  // Use fixedExtension so CJS gets .cjs, ESM gets .mjs, UMD gets .umd.js
  // — avoids filename collisions between formats.
  fixedExtension: true,
  // Don't bundle dependencies by default; everything the browser entry needs is
  // either first-party source or cross-platform Web APIs (TextDecoder).
  deps: {
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
  // node:fs/promises and node:path are Node-only builtins used by the ./node
  // entry; keep them external for ESM and CJS. The browser (index.ts) entry
  // uses only cross-platform Web APIs (TextDecoder, ArrayBuffer, DataView),
  // so UMD needs no Node builtin polyfills.
  inputOptions(options, format) {
    const opts = { ...options };
    if (format === 'cjs' || format === 'esm') {
      const nodeBuiltins = ['node:fs/promises', 'node:path'];
      opts.external = [...(opts.external ?? []), ...nodeBuiltins];
    }
    return opts;
  }
});

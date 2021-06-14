import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import nodePolyfills from 'rollup-plugin-node-polyfills';
import commonjs from '@rollup/plugin-commonjs';
import del from 'rollup-plugin-delete';
import json from '@rollup/plugin-json';
import copy from 'rollup-plugin-copy';
import packageJson from './package.json';

export default {
  input: 'index.ts',
  output: [
    {
      file: packageJson.publishConfig.browser,
      name: packageJson.name,
      format: 'umd'
    },
    {
      file: packageJson.publishConfig.module,
      name: packageJson.name,
      format: 'es',
      sourcemap: true
    },
    {
      file: packageJson.publishConfig.main,
      name: packageJson.name,
      format: 'cjs',
      sourcemap: true
    }
  ],
  plugins: [
    del({ targets: 'dist/*', runOnce: true }),
    nodeResolve({
      preferBuiltins: false,
      extensions: ['.ts']
    }), //
    nodePolyfills(),
    typescript({ abortOnError: true, sourcemap: true, useTsconfigDeclarationDir: true }),
    commonjs(),
    json(),
    copy({
      targets: [
        {
          src: './package.json',
          dest: './dist'
        }
      ]
    })
  ],
  external: [...Object.keys(packageJson.dependencies || {}), ...Object.keys(packageJson.peerDependencies || {})]
};

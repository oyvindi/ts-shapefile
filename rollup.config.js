import typescript from "rollup-plugin-typescript2";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import del from "rollup-plugin-delete";
import json from "@rollup/plugin-json";
import packageJson from "./package.json";

export default {
  input: "index.ts",
  output: {
    file: packageJson.publishConfig.browser,
    name: packageJson.name,
    format: "umd",
  },
  plugins: [
    del({ targets: "dist/*", runOnce: true }),
    nodeResolve([".ts"]),
    typescript({ abortOnError: true, sourcemap: true, useTsconfigDeclarationDir: true }),
    commonjs(),
    json(),
  ],
  external: [...Object.keys(packageJson.dependencies || {}), ...Object.keys(packageJson.peerDependencies || {})],
};

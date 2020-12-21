import typescript from "rollup-plugin-typescript2";
import { terser } from "rollup-plugin-terser";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import packageJson from "./package.json";

export default {
  input: "index.ts",
  output: {
    file: packageJson.main,
    name: "TsShapeFile",
    format: "cjs",
    sourcemap: true,
  },
  plugins: [nodeResolve([".ts"]), json(), commonjs(), typescript(), terser()],
};

# AGENTS.md

Instructions for AI agents working in this repository.

## Dual-target: browser and Node.js

This library targets both browsers and Node.js from a single source tree.
Preserve this when making changes.

- Source code in `src/` must stay platform-agnostic. Use only Web APIs
  available in both environments (`ArrayBuffer`, `DataView`, `TextDecoder`,
  `Promise`). Do not import Node-only modules (`fs`, `path`, `Buffer`,
  `process`, `crypto`, `stream`) into `src/`.
- The browser `File` API is the only browser-coupled surface, used in the
  `fromFile` / `fromFiles` entry points. Every `fromFile` variant must have
  an `fromArrayBuffer` / `fromArrayBuffers` counterpart that takes raw
  `ArrayBuffer`s, so Node consumers can read files themselves and pass bytes in.
- The build emits three formats via `tsdown.config.ts`: CJS (`.cjs`),
  ESM (`.mjs`), and UMD (`.umd.js`). Do not drop a format without reason.
- DBF text decoding uses the Web-standard `TextDecoder` (available in both
  Node and browsers) for encodings the WHATWG Encoding standard covers
  (windows-125x, iso-8859-x, shift_jis, gbk, big5, euc-kr, ibm866,
  windows-874, macintosh, x-mac-cyrillic). Code pages `TextDecoder` does not
  support (DOS OEM, Mac Central European/Greek, Kamenicky, Mazovia) are
  decoded with inline single-byte tables in `src/dbf/sbcsTables.ts`. There is
  no `iconv-lite` dependency.
- `package.json` exposes all three formats through the `exports` field
  (`browser` -> UMD, `import` -> ESM, `require` -> CJS), with per-condition
  `types`. Keep these in sync with the build output.

## Dependencies

- Pin exact versions in `package.json`. Do not prefix versions with `^` or `~`.
  This applies to both `dependencies` and `devDependencies`.

## Tests

- When making changes to this library, update existing tests to reflect the changes.
- Add new tests when relevant to cover new functionality or changed behavior.
- Run `npm test` to verify before considering work complete.

## Documentation

- Whenever the public API changes, update `README.md` to reflect it.
- Use a clean, human-readable language. Add examples if missing.

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
  windows-874, macintosh). Code pages `TextDecoder` does not support
  (DOS OEM, Mac Central European/Greek, x-mac-cyrillic, Kamenicky, Mazovia)
  are decoded with inline single-byte tables in `src/dbf/sbcsTables.ts`.
  There is no `iconv-lite` dependency.
- `package.json` exposes all three formats through the `exports` field
  (`browser` -> UMD, `import` -> ESM, `require` -> CJS), with per-export
  `types`. Keep these in sync with the build output.

## Shapefile / dBASE standard compliance

When editing SHP or DBF parsing code, follow the ESRI Shapefile and dBASE
file format specifications. Common pitfalls:

- **Endianness.** The SHP file header stores the file length at offset 24
  in big-endian, and the shape type at offset 32 in little-endian. Record
  headers (record number, content length) are big-endian. All other record
  fields (shape type, coordinates, measures) are little-endian. SHX index
  entries are big-endian. DBF header fields use little-endian.
- **File length units.** SHP and SHX file lengths are in 16-bit words, not
  bytes. Multiply by 2 to get byte offsets. SHX record offsets are also in
  16-bit words.
- **M-value NaN sentinel.** Per the Shapefile spec, a measure value of
  exactly `-1e38` represents NaN. Use `<=` (not `<`) when comparing against
  the threshold so the exact sentinel is treated as NaN.
- **DBF month encoding.** dBASE stores months as 1-12 (January = 1).
  JavaScript's `Date` constructor expects 0-11 (January = 0). Always
  subtract 1 when constructing a `Date` from a dBASE month. This applies
  to both the header `lastUpdated` date and `D`-type field values.
- **DBF character fields.** Character fields may be null-terminated (0x00)
  or space-padded (0x20). When a null terminator is encountered, decode only
  the bytes up to (not including) the null. `String.trim()` does not remove
  `\u0000` characters.
- **Polygon ring orientation.** Per the Shapefile spec, exterior rings are
  clockwise and interior rings are counter-clockwise. GeoJSON (RFC 7946)
  uses the right-hand rule (exterior counter-clockwise). Ring reversal is
  handled in the geometry classes — do not double-reverse.

For DBF encoding, date, and null-value quirks introduced by Esri beyond the
base dBASE spec (the `.cpg` sidecar file, UTF-8 default, multi-byte field
widths, lack of timestamps, pseudo-null handling), see
`spec/esri_shapefile_dbf_quirks.md`.

## Dependencies

- This library has zero runtime dependencies. Keep it that way.
- Dev dependencies use caret (`^`) ranges for minor/patch updates.

## Tests

- When making changes to this library, update existing tests to reflect the changes.
- Add new tests when relevant to cover new functionality or changed behavior.
- Run `npm test` to verify before considering work complete.

## Documentation

- `README.md` is end-user documentation. Write for the user, not the
  maintainer. State what the library does, its public API, and observable
  properties (bundle size, supported formats, dependencies). Do not describe
  implementation internals (which decoder is used, how tables are sourced,
  internal class structure) — those belong in code comments or AGENTS.md.
- Whenever the public API changes, update `README.md` to reflect it.
- Use a clean, human-readable language. Add examples if missing.

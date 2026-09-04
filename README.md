# TS-shapefile

A TypeScript implementation of ESRI Shapefiles, in browsers or NodeJS.

- Supports legacy and current (.CPG-file) DBF codepages, with all known encodings
- Supports GeoJSON serialization

## Table of Contents

- [Node.js usage](#nodejs-usage)
- [Browser usage](#browser-usage)
- [Reading features (geometry + attributes)](#reading-features-geometry--attributes)
- [Reading geometries only (.shp and .shx)](#reading-geometries-only-shp-and-shx)
- [Reading attributes (.dbf, optionally .cpg) only](#reading-attributes-dbf-optionally-cpg-only)
- [Reading from a .zip archive](#reading-from-a-zip-archive)
  - [Browser](#browser)
  - [Node.js](#nodejs)

### Node.js usage

In Node.js, you can load a shapefile by providing a path to the `.shp` file. The `ShapefileFs` class reads the `.shp` file along with the sibling `.shx`, `.dbf`, and `.cpg` files. The `.shx` file is required; `.dbf` and `.cpg` are optional. If a `.cpg` file is not found, the reader will attempt to resolve the codepage from the DBF header, falling back to CP-1252.

```typescript
import { ShapefileFs } from 'ts-shapefile/node';

// Read features (geometry + attributes) from a single path
const reader = await ShapefileFs.fromPath('path/to/myfile.shp');
console.log(`Feature count: ${reader.featureCount}`);
const collection = reader.readFeatureCollection();
collection.features.forEach((feature) => {
  console.log(JSON.stringify(feature.toGeoJson()));
});
```

Geometry-only and attributes-only variants are also available:

```typescript
import { ShapefileFs } from 'ts-shapefile/node';

// Geometry only (.shp + .shx)
const shpReader = await ShapefileFs.fromPathShp('path/to/myfile.shp');

// Attributes only (.dbf + optional .cpg)
const dbfReader = await ShapefileFs.fromPathDbf('path/to/myfile.dbf');
```

If you already have the file contents in memory (e.g. from a zip stream), you can use the `fromArrayBuffers` / `fromArrayBuffer` methods directly from the core package — see the sections below.

### Browser usage

In the browser, the API consumes `File` objects (e.g. from an `<input type="file">` element) or raw `ArrayBuffer`s. The whole files will be consumed and parsed, so a size check should be performed before consuming large files.

The sections below use `File` objects. Each `fromFile` / `fromFiles` method has a `fromArrayBuffer` / `fromArrayBuffers` counterpart that takes raw `ArrayBuffer`s — useful when you already have the bytes in memory, and also usable in Node.js if needed.

### Reading features (geometry + attributes)

Features can be read one by one, or simply as a whole collection.

```typescript
const reader = await ShapeFeatureReader.fromFiles(shp, shx, dbf, cpg);
console.log(`Feature count: ${reader.featureCount}`);
console.log(`Number of attributes: ${reader.fields.length}`);
reader.fields.forEach((field) => console.log(`  field: ${field.name}(${field.typeName})`));

// Read record by record
for (var i = 0; i < reader.featureCount; i++) {
    const feature = reader.readFeature(i);
    console.log(JSON.stringify(feature.toGeoJson()));
}

// Or read the entire collection at once
const collection = reader.readFeatureCollection();
collection.features.forEach((feature) => { ... } );
```

### Reading geometries only (.shp and .shx)

```typescript
const reader = await ShapeReader.fromFile(shpFile, shxFile);
console.log(`Shape type: ${reader.shapeType}`);
console.log(`Record count: ${reader.recordCount}`);
console.log(`Has Z: ${reader.hasZ}`);
console.log(`Has Z: ${reader.hasM}`);
for (var i = 0; i < reader.recordCount; i++) {
  var geom = reader.readGeom(i);
  console.log(JSON.stringify(geom.toGeoJson()));
}
```

### Reading attributes (.dbf, optionally .cpg) only

Note that if a CPG file is not specifed, the reader will attempt to resolve codepages from the DBF header. If not found, it will fall back to CP-1252

```typescript
const reader = await DbfReader.fromFile(dbfFile, cpgFile);
console.log(`Encoding: ${reader.encoding}`);
console.log(`Record count: ${reader.recordCount}`);
for (var i = 0; i < reader.recordCount; i++) {
  var rec = reader.readRecord(i);
  for (var f = 0; f < reader.fields.length; f++) {
    console.log(`${reader.fields[f].name}(${reader.fields[f].typeName}) = ${rec[f]}`);
  }
}
```

### Reading from a .zip archive

Shapefiles are frequently distributed as `.zip` archives containing the
`.shp`, `.shx`, `.dbf`, and optionally `.cpg` files. This library does not
bundle a zip decoder — use whichever library you prefer to extract the
entries, then pass the raw `ArrayBuffer`s to `fromArrayBuffers`.

For large archives, [unzipit](https://github.com/greggman/unzipit) is a good
choice: it performs random-access decompression, so only the entries you
actually read are inflated rather than the entire archive. It works in both
browsers and Node.js.

#### Browser

```typescript
import { ShapeFeatureReader } from 'ts-shapefile';
import { unzip } from 'unzipit';

// `file` is a File from an <input type="file"> element
const { entries } = await unzip(file);

// Helper: find the first entry whose name ends with the given extension
const findByExt = async (ext: string): Promise<ArrayBuffer | undefined> => {
  const entry = Object.values(entries).find((e) => e.name.toLowerCase().endsWith(ext));
  return entry ? await entry.arrayBuffer() : undefined;
};

const reader = await ShapeFeatureReader.fromArrayBuffers(
  await findByExt('.shp'),
  await findByExt('.shx'),
  await findByExt('.dbf'),
  await findByExt('.cpg')  // optional
);

const collection = reader.readFeatureCollection();
collection.features.forEach((feature) => {
  console.log(JSON.stringify(feature.toGeoJson()));
});
```

#### Node.js

```typescript
import { readFile } from 'node:fs/promises';
import { ShapeFeatureReader } from 'ts-shapefile';
import { unzip } from 'unzipit';

// Read the .zip file into memory, then let unzipit parse it
const data = await readFile('path/to/archive.zip');
const { entries } = await unzip(data);

const findByExt = async (ext: string): Promise<ArrayBuffer | undefined> => {
  const entry = Object.values(entries).find((e) => e.name.toLowerCase().endsWith(ext));
  return entry ? await entry.arrayBuffer() : undefined;
};

const reader = await ShapeFeatureReader.fromArrayBuffers(
  await findByExt('.shp'),
  await findByExt('.shx'),
  await findByExt('.dbf'),
  await findByExt('.cpg')  // optional
);

const collection = reader.readFeatureCollection();
collection.features.forEach((feature) => {
  console.log(JSON.stringify(feature.toGeoJson()));
});
```

The examples above assume a single shapefile bundle per archive. If the
archive contains multiple bundles, group the entries by basename first and
create a reader for each group.

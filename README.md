# TS-shapefile

A TypeScript implementation of ESRI Shapefiles, in browsers or NodeJS.

- Supports legacy and current (.CPG-file) DBF codepages, with all known encodings
- Supports GeoJSON serialization

At the moment, only File (e.g from a HTML file input) sources are supported. The whole files will be consumed and parsed. In order to not kill the browser with large files, a size check should be performed before consuming.

### Reading features (geometry + attributes)

Features can be read one by one, or simply as a whole collection.

```typescript
// Read record by record
console.log(`Feature count: ${reader.featureCount}`);
console.log(`Number of attributes: ${reader.fields.length}`);
reader.fields.forEach((field) => console.log(`  field: ${field.name}(${field.typeName})`));
for (var i = 0; i < reader.featureCount; i++) {
    const feature = reader.readFeature(i);
    console.log(JSON.stringify(feature.toGeoJson()));
}

// Read entire files
const reader = await ShapeFeatureReader.fromFiles(shp, shx, dbf, cpg);
const collection = await reader.readFeatureCollection();
collection.features.forEach((feature) => { ... } );
```

### Reading geometries only (.shp and .shx)

```typescript
const reader = await ShapeReader.fromFile(shpFile, shxFile);
console.log(`Shape type: ${reader.shapeType}`);
console.log(`Record cound: ${reader.recordCount}`);
console.log(`Has Z: ${reader.hasZ}`);
console.log(`Has Z: ${reader.hasM}`);
for (var i = 0; i < reader.recordCount; i++) {
  var geom = reader.readGeom(i);
  console.log(JSON.stringify(geom.toGeoJson()));
}
```

### Reading attributes (.dbf, optionally .cpg) only

Note that if a CPG file is not specifed, the reader will attempt to resolve codepages from the DBF header. If not found, it will default to CP-1252

```typescript
const reader = await DbfReader.fromFile(dbfFile, cpgFile);
console.log(`Encoding: ${reader.encoding}`);
console.log(`Record count: ${reader.recordCount}`);
for (var i = 0; i < reader.recordCount; i++) {
  var rec = reader.readRecord(i);
  for (var f = 0; f < fields.length; f++) {
    console.log(`${fields[f].name}(${fields[f].typeName}) = ${rec[f]}`);
  }
}
```

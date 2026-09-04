import { describe, it, expect } from 'vitest';
import { openTestFile, openTestBuffer, assertThrows } from './util/testUtils';
import { ShapeFeatureReader } from '../src/shapeFeatureReader';
import { ShapeType } from '../src/shp/geom/geometry';
import { ShpPolyLine } from '../src/shp/geom/polyLine';
import { assertCoordsXY } from './util/shapeTestUtils';

describe('ShapeFeatureReader', () => {
  describe('Read feature OK', () => {
    it('', async () => {
      const shp = await openTestFile('featureclass.shp');
      const shx = await openTestFile('featureclass.shx');
      const dbf = await openTestFile('featureclass.dbf');
      const cpg = await openTestFile('featureclass.cpg');
      const reader = await ShapeFeatureReader.fromFiles(shp, shx, dbf, cpg);
      expect(reader.featureCount).toBe(7);
      expect(reader.fields.length).toBe(2);
      expect(reader.fields[0].name).toBe('Id');
      expect(reader.fields[1].name).toBe('name');

      const feature = reader.readFeature(1);
      expect(feature.geom).not.toBeNull();
      expect(feature.attrs).not.toBeNull();

      // Verify geometry
      expect(feature.geom.type).toBe(ShapeType.PolyLine);
      const polyLine = feature.geom as ShpPolyLine;
      expect(polyLine.parts.length).toBe(1);
      assertCoordsXY(polyLine.parts[0].coords, [
        { x: -117.3470458984375, y: -40.57794189453125 },
        { x: -93.57977294921875, y: -42.8712158203125 },
        { x: -96.52655029296875, y: -73.41015625 },
        { x: -120.293701171875, y: -71.11688232421875 },
        { x: -117.3470458984375, y: -40.57794189453125 }
      ]);

      // Verify attributes
      expect(feature.attrs.length).toBe(2);
      expect(feature.attrs[0]).toBe(0);
      expect(feature.attrs[1]).toBe('feature 1');
    });
  });

  describe('Read feature collection', () => {
    it('', async () => {
      const shp = await openTestFile('featureclass.shp');
      const shx = await openTestFile('featureclass.shx');
      const dbf = await openTestFile('featureclass.dbf');
      const cpg = await openTestFile('featureclass.cpg');
      const reader = await ShapeFeatureReader.fromFiles(shp, shx, dbf, cpg);
      const collection = await reader.readFeatureCollection();
      expect(collection.features.length).toBe(7);
      expect(collection.fields.length).toBe(2);
      collection.features.forEach((feature) => {
        expect(feature.geom).not.toBeNull();
        expect(feature.attrs).not.toBeNull();
        expect(feature.attrs.length).toBe(2);
        expect(typeof feature.attrs[0]).toBe('number');
        expect(typeof feature.attrs[1]).toBe('string');
        expect(feature.geom.type).toBe(ShapeType.PolyLine);
      });
    });
  });

  describe('SHP and DBF count mismatch', () => {
    it('Should fail', async () => {
      const shp = await openTestFile('polyline.shp');
      const shx = await openTestFile('polyline.shx');
      const dbf = await openTestFile('featureclass.dbf');
      await assertThrows(async () => {
        await ShapeFeatureReader.fromFiles(shp, shx, dbf);
      }, 'Record count mismatch: SHP-file has 3 records, DBF has 7');
    });
  });

  describe('Read feature (fromArrayBuffers)', () => {
    it('should produce the same result via raw ArrayBuffer input', async () => {
      const shp = await openTestBuffer('featureclass.shp');
      const shx = await openTestBuffer('featureclass.shx');
      const dbf = await openTestBuffer('featureclass.dbf');
      const cpg = await openTestBuffer('featureclass.cpg');
      const reader = await ShapeFeatureReader.fromArrayBuffers(shp, shx, dbf, cpg);
      expect(reader.featureCount).toBe(7);
      expect(reader.fields.length).toBe(2);
      expect(reader.fields[0].name).toBe('Id');
      expect(reader.fields[1].name).toBe('name');

      const feature = reader.readFeature(1);
      expect(feature.geom).not.toBeNull();
      expect(feature.attrs).not.toBeNull();

      expect(feature.geom.type).toBe(ShapeType.PolyLine);
      const polyLine = feature.geom as ShpPolyLine;
      expect(polyLine.parts.length).toBe(1);
      assertCoordsXY(polyLine.parts[0].coords, [
        { x: -117.3470458984375, y: -40.57794189453125 },
        { x: -93.57977294921875, y: -42.8712158203125 },
        { x: -96.52655029296875, y: -73.41015625 },
        { x: -120.293701171875, y: -71.11688232421875 },
        { x: -117.3470458984375, y: -40.57794189453125 }
      ]);

      expect(feature.attrs.length).toBe(2);
      expect(feature.attrs[0]).toBe(0);
      expect(feature.attrs[1]).toBe('feature 1');
    });
  });

  describe('Read feature collection (fromArrayBuffers)', () => {
    it('should produce the same result via raw ArrayBuffer input', async () => {
      const shp = await openTestBuffer('featureclass.shp');
      const shx = await openTestBuffer('featureclass.shx');
      const dbf = await openTestBuffer('featureclass.dbf');
      const cpg = await openTestBuffer('featureclass.cpg');
      const reader = await ShapeFeatureReader.fromArrayBuffers(shp, shx, dbf, cpg);
      const collection = await reader.readFeatureCollection();
      expect(collection.features.length).toBe(7);
      expect(collection.fields.length).toBe(2);
      collection.features.forEach((feature) => {
        expect(feature.geom).not.toBeNull();
        expect(feature.attrs).not.toBeNull();
        expect(feature.attrs.length).toBe(2);
        expect(typeof feature.attrs[0]).toBe('number');
        expect(typeof feature.attrs[1]).toBe('string');
        expect(feature.geom.type).toBe(ShapeType.PolyLine);
      });
    });
  });

  describe('SHP and DBF count mismatch (fromArrayBuffers)', () => {
    it('Should fail', async () => {
      const shp = await openTestBuffer('polyline.shp');
      const shx = await openTestBuffer('polyline.shx');
      const dbf = await openTestBuffer('featureclass.dbf');
      await assertThrows(async () => {
        await ShapeFeatureReader.fromArrayBuffers(shp, shx, dbf);
      }, 'Record count mismatch: SHP-file has 3 records, DBF has 7');
    });
  });
});

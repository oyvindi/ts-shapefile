import { describe, it, expect } from 'vitest';
import { ShapefileFs } from '../src/node/shapefileFs';
import { ShapeType } from '../src/shp/geom/geometry';
import { ShpPolyLine } from '../src/shp/geom/polyLine';
import { assertCoordsXY } from './util/shapeTestUtils';

describe('ShapefileFs', () => {
  describe('fromPath - read feature', () => {
    it('should read features from a .shp path', async () => {
      const reader = await ShapefileFs.fromPath('testdata/featureclass.shp');
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

  describe('fromPath - read feature collection', () => {
    it('should read the entire collection from a .shp path', async () => {
      const reader = await ShapefileFs.fromPath('testdata/featureclass.shp');
      const collection = reader.readFeatureCollection();
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

  describe('fromPathShp - geometry only', () => {
    it('should read geometries from a .shp path without .dbf', async () => {
      const reader = await ShapefileFs.fromPathShp('testdata/polygon.shp');
      expect(reader.shapeType).toBe(ShapeType.Polygon);
      expect(reader.recordCount).toBe(3);
      const geom = reader.readGeom(0);
      expect(geom).not.toBeNull();
    });
  });

  describe('fromPathDbf - attributes only', () => {
    it('should read attributes from a .dbf path', async () => {
      const reader = await ShapefileFs.fromPathDbf('testdata/featureclass.dbf');
      expect(reader.recordCount).toBe(7);
      expect(reader.fields.length).toBe(2);
      const record = reader.readRecord(1);
      expect(record[0]).toBe(0);
      expect(record[1]).toBe('feature 1');
    });
  });

  describe('fromPath - missing .shx', () => {
    it('should throw when .shx is missing', async () => {
      await expect(ShapefileFs.fromPath('testdata/nonexistent.shp')).rejects.toThrow();
    });
  });
});

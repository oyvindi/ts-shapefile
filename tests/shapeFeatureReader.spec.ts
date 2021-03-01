import { describe, it } from 'mocha';
import { assert } from 'chai';
import { openTestFile, assertThrows } from './util/testUtils';
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
      assert.equal(reader.featureCount, 7);
      assert.equal(2, reader.fields.length);
      assert.equal(reader.fields[0].name, 'Id');
      assert.equal(reader.fields[1].name, 'name');

      const feature = reader.readFeature(1);
      assert.isNotNull(feature.geom);
      assert.isNotNull(feature.attrs);

      // Verify geometry
      assert.equal(ShapeType.PolyLine, feature.geom.type);
      const polyLine = feature.geom as ShpPolyLine;
      assert.equal(polyLine.parts.length, 1);
      assertCoordsXY(polyLine.parts[0].coords, [
        { x: -117.3470458984375, y: -40.57794189453125 },
        { x: -93.57977294921875, y: -42.8712158203125 },
        { x: -96.52655029296875, y: -73.41015625 },
        { x: -120.293701171875, y: -71.11688232421875 },
        { x: -117.3470458984375, y: -40.57794189453125 }
      ]);

      // Verify attributes
      assert.equal(2, feature.attrs.length);
      assert.equal(feature.attrs[0], 0);
      assert.equal(feature.attrs[1], 'feature 1');
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
      assert.equal(collection.features.length, 7);
      assert.equal(2, collection.fields.length);
      collection.features.forEach((feature) => {
        assert.isNotNull(feature.geom);
        assert.isNotNull(feature.attrs);
        assert.equal(feature.attrs.length, 2);
        assert.isNumber(feature.attrs[0]);
        assert.isString(feature.attrs[1]);
        assert.equal(feature.geom.type, ShapeType.PolyLine);
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
});

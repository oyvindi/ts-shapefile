import { describe, it } from 'mocha';
import { assert } from 'chai';
import { ShapeType } from '../src/shp/geom/geometry';
import { createAndVerifyReader, tolerance } from './util/shapeTestUtils';

describe('ShapeReader', () => {
  describe('extent', () => {
    it('', async () => {
      const reader = await createAndVerifyReader('polygon.shp', 'polygon.shx', ShapeType.Polygon, 3);
      assert.closeTo(reader.extent.xMin, -263.58181430356285, tolerance);
      assert.closeTo(reader.extent.xMax, 100, tolerance);
      assert.closeTo(reader.extent.yMin, -141.77167490179193, tolerance);
      assert.closeTo(reader.extent.yMax, 60, tolerance);
    });
  });
});

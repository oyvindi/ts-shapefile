import { describe, it, expect } from 'vitest';
import { ShapeType } from '../src/shp/geom/geometry';
import { createAndVerifyReader, tolerance } from './util/shapeTestUtils';

describe('ShapeReader', () => {
  describe('extent', () => {
    it('', async () => {
      const reader = await createAndVerifyReader('polygon.shp', 'polygon.shx', ShapeType.Polygon, 3);
      expect(reader.extent.xMin).toBeCloseTo(-263.58181430356285, 7);
      expect(reader.extent.xMax).toBeCloseTo(100, 7);
      expect(reader.extent.yMin).toBeCloseTo(-141.77167490179193, 7);
      expect(reader.extent.yMax).toBeCloseTo(60, 7);
    });
  });
});

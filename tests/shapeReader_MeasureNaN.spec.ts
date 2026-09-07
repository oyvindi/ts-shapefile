import { describe, it, expect } from 'vitest';
import { ShapeReader } from '../src/shp/shapeReader';
import { ShapeType } from '../src/shp/geom/geometry';
import { ShpPoint } from '../src/shp/geom/point';

// Builds a minimal .shp + .shx pair containing a single PointM record
// with the M value set to the exact NaN sentinel (-1e38).
const buildPointMWithSentinelM = (): { shp: ArrayBuffer; shx: ArrayBuffer } => {
  // SHP header: 100 bytes
  // Record header: 8 bytes (record number + content length, big-endian)
  // Record content: shape type (4 bytes, LE) + X (8) + Y (8) + M (8) = 28 bytes
  const shpSize = 100 + 8 + 28;
  const shp = new ArrayBuffer(shpSize);
  const shpView = new DataView(shp);
  const shpBytes = new Uint8Array(shp);

  // SHP file header
  shpView.setInt32(0, 9994, false); // file code (big-endian)
  // bytes 4-23: unused (zeros)
  shpView.setInt32(24, shpSize / 2, false); // file length in 16-bit words (big-endian)
  shpView.setInt32(28, 1000, false); // version (big-endian, unused but set)
  shpView.setInt32(32, ShapeType.PointM, true); // shape type (little-endian)
  // bytes 36-99: bounding box (zeros)

  // Record 0 at offset 100
  shpView.setInt32(100, 1, false); // record number (big-endian)
  shpView.setInt32(104, 28 / 2, false); // content length in 16-bit words (big-endian)
  shpView.setInt32(108, ShapeType.PointM, true); // shape type (little-endian)
  shpView.setFloat64(112, 10.0, true); // X
  shpView.setFloat64(120, 20.0, true); // Y
  shpView.setFloat64(128, -1e38, true); // M = exactly the NaN sentinel

  // SHX file: 100-byte header + 8 bytes per record
  const shxSize = 100 + 8;
  const shx = new ArrayBuffer(shxSize);
  const shxView = new DataView(shx);
  shxView.setInt32(0, 9994, false); // file code
  shxView.setInt32(24, shxSize / 2, false); // file length in 16-bit words
  shxView.setInt32(28, 1000, false); // version
  shxView.setInt32(32, ShapeType.PointM, true); // shape type
  // SHX record: offset (big-endian, in words) + content length (big-endian, in words)
  shxView.setInt32(100, 100 / 2, false); // offset = 100 bytes = 50 words
  shxView.setInt32(104, 28 / 2, false); // content length = 14 words

  return { shp, shx };
};

describe('ShapeReader M-value NaN sentinel', () => {
  it('should treat exactly -1e38 as NaN (per Shapefile spec)', async () => {
    const { shp, shx } = buildPointMWithSentinelM();
    const reader = await ShapeReader.fromArrayBuffer(shp, shx);
    expect(reader.shapeType).toBe(ShapeType.PointM);
    expect(reader.recordCount).toBe(1);
    const geom = reader.readGeom(0) as ShpPoint;
    expect(geom.x).toBeCloseTo(10.0, 7);
    expect(geom.y).toBeCloseTo(20.0, 7);
    expect(geom.m).toBeNaN();
  });
});

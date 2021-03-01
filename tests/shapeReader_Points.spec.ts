import { describe, it } from 'mocha';
import { assert } from 'chai';
import { ShapeType } from '../src/shp/geom/geometry';
import { ShpPoint, ShpPointType } from '../src/shp/geom/point';
import { assertValueOrNan, createAndVerifyReader, tolerance } from './util/shapeTestUtils';

const assertPoint = (p: ShpPoint, expectedX: number, expectedY: number, expectedType: ShpPointType) => {
  assert.closeTo(p.x, expectedX, tolerance, 'Wrong X ordinate');
  assert.closeTo(p.y, expectedY, tolerance, 'Wrong Y ordinate');
  assert.equal(p.type, expectedType);
  if (expectedType === ShapeType.Point || expectedType === ShapeType.PointM) {
    assert.isFalse(p.hasZ);
    assert.isNaN(p.z);
  } else {
    assert.isTrue(p.hasZ);
  }
  if (expectedType === ShapeType.Point) {
    assert.isNaN(p.m);
    assert.isFalse(p.hasM);
  }
};

const assertPointXY = (p: ShpPoint, expectedX: number, expectedY: number) => {
  assertPoint(p, expectedX, expectedY, ShapeType.Point);
};

const assertPointXYM = (p: ShpPoint, expectedX: number, expectedY: number, expectedM: number) => {
  assertPoint(p, expectedX, expectedY, ShapeType.PointM);
  assertValueOrNan(p.m, expectedM, 'Wrong M value');
};

const assertPointXYZM = (p: ShpPoint, expectedX: number, expectedY: number, expectedZ: number, expectedM: number) => {
  assertPoint(p, expectedX, expectedY, ShapeType.PointZ);
  assertValueOrNan(p.z, expectedZ, 'Wrong Z value');
  assertValueOrNan(p.m, expectedM, 'Wrong M value');
};

describe('ShapeReader Points', () => {
  describe('Point', () => {
    it('', async () => {
      const reader = await createAndVerifyReader('point.shp', 'point.shx', ShapeType.Point, 7);
      for (let i = 0; i < reader.recordCount; i++) {
        const geom = reader.readGeom(i) as ShpPoint;
        // console.log(JSON.stringify(geom.toGeoJson()));
        switch (i) {
          case 0:
            assertPointXY(geom, -155, -154);
            break;
          case 4:
            assertPointXY(geom, -147.43741476950902, -157.28937716011498);
            break;
        }
      }
    });
  });

  describe('PointM', () => {
    it('', async () => {
      const reader = await createAndVerifyReader('pointM.shp', 'pointM.shx', ShapeType.PointM, 5);
      for (let i = 0; i < reader.recordCount; i++) {
        const geom = reader.readGeom(i) as ShpPoint;
        // console.log(JSON.stringify(geom.toGeoJson()));

        switch (i) {
          case 0:
            assertPointXYM(geom, -178, -160, 1);
            break;
          case 1:
            assertPointXYM(geom, -177, -165, 1000);
            break;
          case 2:
            assertPointXYM(geom, -171, -165, NaN);
            break;
        }
      }
    });
  });

  describe('PointZ', () => {
    it('', async () => {
      const reader = await createAndVerifyReader('pointZM.shp', 'pointZM.shx', ShapeType.PointZ, 6);
      for (let i = 0; i < reader.recordCount; i++) {
        const geom = reader.readGeom(i) as ShpPoint;
        // console.log(JSON.stringify(geom.toGeoJson()));

        switch (i) {
          case 0:
            assertPointXYZM(geom, -153, -178, 1, 2);
            break;
          case 1:
            assertPointXYZM(geom, -158, -175, 2, 3);
            break;
          case 5:
            assertPointXYZM(geom, -159, -186, 99.999, NaN);
            break;
        }
      }
    });
  });
});

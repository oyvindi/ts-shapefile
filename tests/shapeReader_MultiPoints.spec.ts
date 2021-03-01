import { describe, it } from 'mocha';
import { assert } from 'chai';
import { ShapeType } from '../src/shp/geom/geometry';
import { ShpMultiPoint, ShpMultiPointType } from '../src/shp/geom/multiPoint';
import { assertCoordsXY, assertCoordsXYM, assertCoordsXYZM, createAndVerifyReader } from './util/shapeTestUtils';

const assertMultiPoint = (pl: ShpMultiPoint, expectedType: ShpMultiPointType) => {
  assert.equal(pl.type, expectedType);
  switch (expectedType) {
    case ShapeType.MultiPoint:
      assert.isFalse(pl.hasZ);
      assert.isFalse(pl.hasM);
      break;
    case ShapeType.MultiPointZ:
      assert.isTrue(pl.hasZ);
      assert.isTrue(pl.hasM);
      break;
    case ShapeType.MultiPointM:
      assert.isFalse(pl.hasZ);
      assert.isTrue(pl.hasM);
      break;
  }
};

describe('ShapeReader MultiPoints', () => {
  describe('Multipoint', () => {
    it('', async () => {
      const reader = await createAndVerifyReader('multipoint.shp', 'multipoint.shx', ShapeType.MultiPoint, 3);
      for (let i = 0; i < reader.recordCount; i++) {
        const geom = reader.readGeom(i) as ShpMultiPoint;
        assertMultiPoint(geom, ShapeType.MultiPoint);
        switch (i) {
          case 0:
            assertCoordsXY(geom.points, [
              { x: 36.963112042621276, y: -129.36489649456098 },
              { x: 37.148521428162326, y: -118.98197090426271 },
              { x: 41.227527910065135, y: -126.3983463259043 },
              { x: 47.71685640400153, y: -130.10653403672512 },
              { x: 48.273084560624625, y: -124.35884308495292 }
            ]);
            break;

          case 1:
            assertCoordsXY(geom.points, [
              { x: 56.060278753348484, y: -131.96062789213556 },
              { x: 57.72896322321782, y: -136.41045314512053 },
              { x: 61.0663321629566, y: -136.03963437403843 },
              { x: 63.662063560531124, y: -131.21899034997142 }
            ]);
            break;

          case 2:
            assertCoordsXY(geom.points, [
              { x: 44.564896849803915, y: -151.05779460286274 },
              { x: 47.71685640400153, y: -142.3435534824339 },
              { x: 53.093728584691746, y: -140.86027839810544 }
            ]);
            break;
        }
      }
    });
  });

  describe('MultipointM', () => {
    it('', async () => {
      const reader = await createAndVerifyReader('multipointM.shp', 'multipointM.shx', ShapeType.MultiPointM, 3);
      for (let i = 0; i < reader.recordCount; i++) {
        const geom = reader.readGeom(i) as ShpMultiPoint;
        assertMultiPoint(geom, ShapeType.MultiPointM);
        switch (i) {
          case 0:
            assertCoordsXYM(geom.points, [
              { x: 88.87773999411263, y: -137.89372822944887, m: 1 },
              { x: 92.95674647601561, y: -143.08519102459798, m: 2 },
              { x: 92.95674647601561, y: -134.185540518628, m: 3 },
              { x: 96.29411541575422, y: -133.6293123620049, m: 4 },
              { x: 97.59198111454151, y: -141.41650655472864, m: 5 }
            ]);
            break;

          case 1:
            assertCoordsXYM(geom.points, [
              { x: 96.10870603021323, y: -121.94852107291939, m: 44 },
              { x: 98.33361865670565, y: -127.32539325360949, m: 55 },
              { x: 101.11475943982134, y: -122.69015861508353, m: 66 }
            ]);
            break;

          case 2:
            assertCoordsXYM(geom.points, [
              { x: 104.45212837956001, y: -133.2584935909228, m: 5 },
              { x: 106.86245039159343, y: -136.96668130174362, m: 55 },
              { x: 108.34572547592188, y: -128.06703079577363, m: 555 },
              { x: 112.79555072890696, y: -134.00013113308705, m: 5555 }
            ]);
            break;
        }
      }
    });
  });

  describe('MultipointZ', () => {
    it('', async () => {
      const reader = await createAndVerifyReader('multipointZM.shp', 'multipointZM.shx', ShapeType.MultiPointZ, 3);
      for (let i = 0; i < reader.recordCount; i++) {
        const geom = reader.readGeom(i) as ShpMultiPoint;
        assertMultiPoint(geom, ShapeType.MultiPointZ);
        switch (i) {
          case 0:
            assertCoordsXYZM(geom.points, [
              { x: 106.12081284942929, y: -160.14285449437375, z: 0, m: NaN },
              { x: 106.86245039159343, y: -155.32221047030666, z: 0, m: NaN },
              { x: 109.08736301808602, y: -159.2158075666685, z: 0, m: NaN },
              { x: 110.01440994579121, y: -162.92399527748938, z: 0, m: NaN },
              { x: 112.98096011444795, y: -153.65352600043735, z: 0, m: NaN },
              { x: 114.09341642769414, y: -160.3282638799148, z: 0, m: NaN }
            ]);
            break;

          case 1:
            assertCoordsXYZM(geom.points, [{ x: 110.01440994579121, y: -149.57451951853437, z: -10, m: -10 }]);
            break;

          case 2:
            assertCoordsXYZM(geom.points, [
              { x: 89.06314937965368, y: -154.02434477151942, z: 22, m: -10 },
              { x: 91.8442901627692, y: -161.81153896424308, z: 33, m: -20 },
              { x: 96.10870603021323, y: -155.5076198558477, z: 44, m: -30 }
            ]);
            break;
        }
      }
    });
  });
});

import { describe, it } from 'mocha';
import { assert } from 'chai';
import { ShapeType } from '../src/shp/geom/geometry';
import { ShpPolygon, ShpPolygonType } from '../src/shp/geom/polygon';
import { assertCoordsXY, assertCoordsXYM, assertCoordsXYZM, createAndVerifyReader } from './util/shapeTestUtils';

const assertPolygon = (pl: ShpPolygon, index: number, expectedType: ShpPolygonType, expextedParts: number) => {
  assert.equal(pl.parts.length, expextedParts, `Unexpected number of parts in polygon ${index}`);
  assert.equal(pl.type, expectedType);
  switch (expectedType) {
    case ShapeType.Polygon:
      assert.isFalse(pl.hasZ);
      assert.isFalse(pl.hasM);
      break;
    case ShapeType.PolygonZ:
      assert.isTrue(pl.hasZ);
      assert.isTrue(pl.hasM);
      break;
    case ShapeType.PolygonM:
      assert.isFalse(pl.hasZ);
      assert.isTrue(pl.hasM);
      break;
  }
};

describe('ShapeReader Polygons', () => {
  describe('Polygon', () => {
    it('', async () => {
      const reader = await createAndVerifyReader('polygon.shp', 'polygon.shx', ShapeType.Polygon, 3);
      for (let i = 0; i < reader.recordCount; i++) {
        const geom = reader.readGeom(i) as ShpPolygon;
        switch (i) {
          case 0:
            // Polygon with 2 holes
            assertPolygon(geom, i, ShapeType.Polygon, 1);
            assert.equal(2, geom.parts[0].interiorRings.length);
            assertCoordsXY(geom.parts[0].exteriorRing.coords, [
              { x: 100, y: 60 },
              { x: 100, y: -40 },
              { x: -100, y: -40 },
              { x: -100, y: 60 },
              { x: 100, y: 60 }
            ]);
            assertCoordsXY(geom.parts[0].interiorRings[0].coords, [
              { x: 60, y: 40 },
              { x: 35, y: 40 },
              { x: 35, y: -15 },
              { x: 60, y: -15 },
              { x: 60, y: 40 }
            ]);
            assertCoordsXY(geom.parts[0].interiorRings[1].coords, [
              { x: -40, y: 40 },
              { x: -40, y: -10 },
              { x: -10, y: -10 },
              { x: -10, y: 40 },
              { x: -40, y: 40 }
            ]);
            break;

          case 1:
            assertPolygon(geom, i, ShapeType.Polygon, 1);
            assert.equal(0, geom.parts[0].interiorRings.length);
            assertCoordsXY(geom.parts[0].exteriorRing.coords, [
              { x: -190, y: 55 },
              { x: -170, y: 55 },
              { x: -140, y: -35 },
              { x: -210, y: -35 },
              { x: -190, y: 55 }
            ]);
            break;

          case 2:
            // Multipolygon with holes in some islands
            assertPolygon(geom, i, ShapeType.Polygon, 3);
            assert.equal(2, geom.parts[0].interiorRings.length);
            assert.equal(0, geom.parts[1].interiorRings.length);
            assert.equal(1, geom.parts[2].interiorRings.length);

            // Poly 1, exterior
            assertCoordsXY(geom.parts[0].exteriorRing.coords, [
              { x: -149.92383493947585, y: -107.20901451037372 },
              { x: -140.61850329563254, y: -125.81967779806041 },
              { x: -203.09715861858095, y: -141.77167490179193 },
              { x: -258.2644819356524, y: -134.460342895915 },
              { x: -259.59381502763006, y: -109.20301414834012 },
              { x: -149.92383493947585, y: -107.20901451037372 }
            ]);
            // Poly 1, interior 1
            assertCoordsXY(geom.parts[0].interiorRings[0].coords, [
              { x: -254.4534848633285, y: -128.68537469897 },
              { x: -239.54032744438703, y: -128.88966452662675 },
              { x: -241.1746460656409, y: -113.77221728002854 },
              { x: -252.63985750747375, y: -113.16878509887954 },
              { x: -254.4534848633285, y: -128.68537469897 }
            ]);
            // Poly 1, interior 2
            assertCoordsXY(geom.parts[0].interiorRings[1].coords, [
              { x: -211.55262105541485, y: -114.18079693534207 },
              { x: -222.17569209356486, y: -126.02960693943254 },
              { x: -198.47807208538396, y: -125.41673745646227 },
              { x: -211.55262105541485, y: -114.18079693534207 }
            ]);

            // Poly 2, exterior only
            assertCoordsXY(geom.parts[1].exteriorRing.coords, [
              { x: -217.05515608434595, y: -92.58635049861982 },
              { x: -263.58181430356285, y: -92.58635049861982 },
              { x: -241.64781828593203, y: -65.33502211307837 },
              { x: -217.05515608434595, y: -92.58635049861982 }
            ]);

            // Poly 3, exterior
            assertCoordsXY(geom.parts[2].exteriorRing.coords, [
              { x: -154.57650076139757, y: -62.01168938313447 },
              { x: -150.58850148546466, y: -95.24501668257506 },
              { x: -190.46849424479345, y: -92.58635049861982 },
              { x: -190.46849424479345, y: -62.67635592912325 },
              { x: -154.57650076139757, y: -62.01168938313447 }
            ]);
            // Poly 1, interior (single)
            assertCoordsXY(geom.parts[2].interiorRings[0].coords, [
              { x: -183.15633501112902, y: -68.82845519554763 },
              { x: -183.36062483878575, y: -87.2145396846534 },
              { x: -160.48016414123182, y: -87.2145396846534 },
              { x: -161.2973234518588, y: -68.82845519554763 },
              { x: -183.15633501112902, y: -68.82845519554763 }
            ]);
            break;
        }
      }
    });
  });

  describe('PolygonM', () => {
    it('', async () => {
      const reader = await createAndVerifyReader('polygonM.shp', 'polygonM.shx', ShapeType.PolygonM, 2);
      for (let i = 0; i < reader.recordCount; i++) {
        const geom = reader.readGeom(i) as ShpPolygon;
        switch (i) {
          case 0:
            // Single poly, no holes
            assert.equal(geom.parts.length, 1);
            assert.equal(geom.parts[0].interiorRings.length, 0);
            assertCoordsXYM(geom.parts[0].exteriorRing.coords, [
              { x: -70, y: -115, m: 40 },
              { x: -44, y: -115, m: 50 },
              { x: -56, y: -132, m: 60 },
              { x: -70, y: -115, m: 40 }
            ]);
            break;

          case 1:
            // Multipoly with 3 islands, last one with 3 holes
            assert.equal(geom.parts.length, 3);
            assert.equal(geom.parts[0].interiorRings.length, 0);
            assert.equal(geom.parts[1].interiorRings.length, 0);
            assert.equal(geom.parts[2].interiorRings.length, 3);
            assertCoordsXYM(geom.parts[0].exteriorRing.coords, [
              { x: 34.44082552002709, y: -157.7606773230082, m: 5 },
              { x: 23.31626238756462, y: -165.56738829315734, m: 6 },
              { x: 20.97424909651994, y: -153.27181851517253, m: 7 },
              { x: 34.44082552002709, y: -157.7606773230082, m: 5 }
            ]);

            assertCoordsXYM(geom.parts[1].exteriorRing.coords, [
              { x: 4, y: -153, m: 1 },
              { x: 2, y: -170, m: 2 },
              { x: -22, y: -168, m: 3 },
              { x: -27, y: -153, m: 4 },
              { x: 4, y: -153, m: 1 }
            ]);

            assertCoordsXYM(geom.parts[2].exteriorRing.coords, [
              { x: 21.36458464502732, y: -114.82376698718815, m: 8 },
              { x: 23.511430161818396, y: -145.4651075450234, m: 9 },
              { x: -33.47755992027015, y: -143.1230942539787, m: 10 },
              { x: -29.76937220944933, y: -116.18994140696418, m: 11 },
              { x: 21.36458464502732, y: -114.82376698718815, m: 8 }
            ]);
            assertCoordsXYM(geom.parts[2].interiorRings[0].coords, [
              { x: -11.033265881091495, y: -120.87396798905371, m: 12 },
              { x: -12.5946080751213, y: -130.24202115323266, m: 13 },
              { x: 0.4816327998785255, y: -133.75504108979976, m: 14 },
              { x: 0.8719683483859058, y: -121.8498068603223, m: 15 },
              { x: -10.83809810683772, y: -120.87396798905371, m: 16 },
              { x: -11.033265881091495, y: -120.87396798905371, m: 12 }
            ]);
            assertCoordsXYM(geom.parts[2].interiorRings[1].coords, [
              { x: 8.953915923251884, y: -129.89172001995667, m: NaN },
              { x: 4.580156059206786, y: -138.82940322039667, m: NaN },
              { x: 15.314383643161705, y: -138.82940322039667, m: NaN },
              { x: 9.264182641296316, y: -130.04685337897888, m: NaN },
              { x: 8.953915923251884, y: -129.89172001995667, m: NaN }
            ]);
            assertCoordsXYM(geom.parts[2].interiorRings[2].coords, [
              { x: -10.057427009822845, y: -140.1955776401727, m: 33 },
              { x: -15.131789140419755, y: -131.4130277987549, m: 44 },
              { x: -25.67084895012107, y: -123.60631682860594, m: 55 },
              { x: -28.98870111243434, y: -138.43906767188923, m: 66 },
              { x: -10.057427009822845, y: -140.1955776401727, m: 33 }
            ]);

            break;
        }
      }
    });
  });

  describe('PolygonZ', () => {
    it('', async () => {
      const reader = await createAndVerifyReader('polygonZM.shp', 'polygonZM.shx', ShapeType.PolygonZ, 2);
      for (let i = 0; i < reader.recordCount; i++) {
        const geom = reader.readGeom(i) as ShpPolygon;
        switch (i) {
          case 0:
            // simple polygon, no holes
            assert.equal(geom.parts.length, 1);
            assert.equal(geom.parts[0].interiorRings.length, 0);
            assertCoordsXYZM(geom.parts[0].exteriorRing.coords, [
              { x: 32, y: -86, z: 10, m: 1 },
              { x: 46, y: -86, z: 20, m: NaN },
              { x: 50, y: -100, z: 30, m: 2 },
              { x: 33, y: -101, z: 0, m: NaN },
              { x: 32, y: -86, z: 10, m: 1 }
            ]);
            break;
          case 1:
            assert.equal(geom.parts.length, 3);
            assert.equal(geom.parts[0].interiorRings.length, 3);
            assert.equal(geom.parts[1].interiorRings.length, 0);
            assert.equal(geom.parts[2].interiorRings.length, 0);

            // Polygon 1 exterior
            assertCoordsXYZM(geom.parts[0].exteriorRing.coords, [
              { x: 84, y: -108, z: 0, m: 5 },
              { x: 86, y: -124, z: 0, m: 6 },
              { x: 72, y: -130, z: 0, m: 7 },
              { x: 61, y: -120, z: 0, m: 8 },
              { x: 67, y: -108, z: 0, m: 9 },
              { x: 84, y: -108, z: 0, m: 5 }
            ]);
            assertCoordsXYZM(geom.parts[0].interiorRings[0].coords, [
              { x: 66.83518332201072, y: -116.61642294039177, z: 0, m: NaN },
              { x: 72.99209448485459, y: -118.9252646264581, z: 0, m: NaN },
              { x: 69.42388460638824, y: -111.64891507037015, z: 0, m: NaN },
              { x: 66.83518332201072, y: -116.61642294039177, z: 0, m: NaN }
            ]);
            assertCoordsXYZM(geom.parts[0].interiorRings[1].coords, [
              { x: 75.51083086965417, y: -111.78884486952569, z: 0, m: NaN },
              { x: 76.70023416247636, y: -118.43551032941377, z: 0, m: NaN },
              { x: 82.78718042574235, y: -117.80582623321385, z: 0, m: NaN },
              { x: 81.17798773545354, y: -111.71887996994786, z: 0, m: NaN },
              { x: 75.51083086965417, y: -111.78884486952569, z: 0, m: NaN }
            ]);
            assertCoordsXYZM(geom.parts[0].interiorRings[2].coords, [
              { x: 73.2019891835879, y: -126.20161418254617, z: 0, m: NaN },
              { x: 75.23097127134315, y: -126.34154398170176, z: 0, m: NaN },
              { x: 77.18998845952069, y: -125.64189498592401, z: 0, m: NaN },
              { x: 78.37939175234271, y: -124.66238639183524, z: 0, m: NaN },
              { x: 78.51932155149831, y: -122.5634394045021, z: 0, m: NaN },
              { x: 77.0500586603651, y: -120.81431691505787, z: 0, m: NaN },
              { x: 74.3214275768322, y: -120.04470301970241, z: 0, m: NaN },
              { x: 71.52283159372138, y: -120.60442221632462, z: 0, m: NaN },
              { x: 70.40339320047707, y: -121.79382550914664, z: 0, m: NaN },
              { x: 70.19349850174376, y: -123.89277249647978, z: 0, m: NaN },
              { x: 71.24297199541036, y: -125.01221088972409, z: 0, m: NaN },
              { x: 73.2019891835879, y: -126.20161418254617, z: 0, m: NaN }
            ]);
            break;
        }
      }
    });
  });
});

import { describe, it } from 'mocha';
import { assert } from 'chai';
import { ShapeType } from '../src/shp/geom/geometry';
import { ShpPolyLine, ShpPolylineType } from '../src/shp/geom/polyLine';
import { assertCoordsXY, assertCoordsXYM, assertCoordsXYZM, createAndVerifyReader } from './util/shapeTestUtils';

const assertPolyLine = (pl: ShpPolyLine, index: number, expectedType: ShpPolylineType, expextedParts: number) => {
  assert.equal(pl.parts.length, expextedParts, `Unexpected number of parts in polyline ${index}`);
  assert.equal(pl.type, expectedType);
  switch (expectedType) {
    case ShapeType.PolyLine:
      assert.isFalse(pl.hasZ);
      assert.isFalse(pl.hasM);
      break;
    case ShapeType.PolyLineZ:
      assert.isTrue(pl.hasZ);
      assert.isTrue(pl.hasM);
      break;
    case ShapeType.PolyLineM:
      assert.isFalse(pl.hasZ);
      assert.isTrue(pl.hasM);
      break;
  }
};

describe('ShapeReader Polylines', () => {
  describe('PolyLine', () => {
    it('', async () => {
      const reader = await createAndVerifyReader('polyline.shp', 'polyline.shx', ShapeType.PolyLine, 3);
      for (let i = 0; i < reader.recordCount; i++) {
        const geom = reader.readGeom(i) as ShpPolyLine;
        assert.isFalse(geom.hasZ);
        assert.isFalse(geom.hasM);
        // console.log(JSON.stringify(geom.toGeoJson()));
        switch (i) {
          case 0:
            assertPolyLine(geom, i, ShapeType.PolyLine, 1);
            assertCoordsXY(geom.parts[0].coords, [
              { x: -174.45654274957514, y: -156.65454128286527 },
              { x: -156.03631387961016, y: -160.44694134432868 },
              { x: -146.82619944462766, y: -153.40391265875377 }
            ]);
            break;
          case 1:
            assertPolyLine(geom, i, ShapeType.PolyLine, 1);
            break;
          case 2:
            assertPolyLine(geom, i, ShapeType.PolyLine, 3);
            assertCoordsXY(geom.parts[0].coords, [
              { x: -198.83625743041105, y: -175.07477015283018 },
              { x: -173.37299987487125, y: -185.36842746251656 },
              { x: -156.03631387961016, y: -185.91019889986848 },
              { x: -122.98825620114354, y: -172.90768440342256 }
            ]);
            assertCoordsXY(geom.parts[1].coords, [
              { x: -201.54511461717064, y: -185.91019889986848 },
              { x: -175.54008562427896, y: -199.45448483366619 },
              { x: -153.86922813020246, y: -199.99625627101807 },
              { x: -132.74014207347795, y: -192.41145614809136 }
            ]);
            assertCoordsXY(geom.parts[2].coords, [
              { x: -205.87928611598593, y: -208.66459926864866 },
              { x: -125.69711338790313, y: -208.66459926864866 }
            ]);
            break;
        }
      }
    });
  });

  describe('PolyLineM', () => {
    it('', async () => {
      const reader = await createAndVerifyReader('polylineM.shp', 'polylineM.shx', ShapeType.PolyLineM, 3);
      for (let i = 0; i < reader.recordCount; i++) {
        const geom = reader.readGeom(i) as ShpPolyLine;
        assert.isFalse(geom.hasZ);
        assert.isTrue(geom.hasM);

        // console.log(" \n" + JSON.stringify(geom.toGeoJson()));
        switch (i) {
          case 0:
            assertPolyLine(geom, i, ShapeType.PolyLineM, 1);
            assertCoordsXYM(geom.parts[0].coords, [
              { x: 39.19402681053475, y: -113.24564852679453, m: 10 },
              { x: 55.850253851346736, y: -88.55874059130537, m: 20 },
              { x: 64.17836737175264, y: -110.86618752096422, m: 30 }
            ]);
            break;
          case 1:
            assertPolyLine(geom, i, ShapeType.PolyLineM, 1);
            assertCoordsXYM(geom.parts[0].coords, [
              { x: 24.619828149824286, y: -98.96888249181285, m: 9 },
              { x: 36.517133178975655, y: -138.22998908801242, m: 8 },
              { x: 52.57849496833006, y: -106.10726550930372, m: 7 },
              { x: 64.17836737175264, y: -140.01458484238515, m: 6 },
              { x: 75.77823977517522, y: -100.75347824618558, m: 5 }
            ]);
            break;
          case 2:
            assertPolyLine(geom, i, ShapeType.PolyLineM, 3);
            assertCoordsXYM(geom.parts[0].coords, [
              { x: 19.510528187285388, y: -131.68610446682828, m: 1 },
              { x: 50.58258088958462, y: -148.75866089666312, m: 2 },
              { x: 88.82510729241454, y: -130.3202999524416, m: 3 }
            ]);
            assertCoordsXYM(geom.parts[1].coords, [
              { x: 6.5353853006108125, y: -140.5638338103425, m: 9 },
              { x: 42.72920493186058, y: -158.66074362596729, m: 8 },
              { x: 62.19191926187227, y: -158.66074362596729, m: 7 },
              { x: 98.72719002171857, y: -135.78351800998865, m: 6 }
            ]);
            assertCoordsXYM(geom.parts[2].coords, [
              { x: 9.949896586577893, y: -168.56282635527143, m: 100 },
              { x: 99.06864115031533, y: -167.19702184088464, m: 200 }
            ]);
            break;
        }
      }
    });
  });

  describe('PolyLineZ', () => {
    it('', async () => {
      const reader = await createAndVerifyReader('polylineZM.shp', 'polylineZM.shx', ShapeType.PolyLineZ, 3);
      for (let i = 0; i < reader.recordCount; i++) {
        const geom = reader.readGeom(i) as ShpPolyLine;
        assert.isTrue(geom.hasZ);
        assert.isTrue(geom.hasM);
        // console.log(" \n" + JSON.stringify(geom.toGeoJson()));
        switch (i) {
          case 0:
            assertPolyLine(geom, i, ShapeType.PolyLineZ, 1);
            assertCoordsXYZM(geom.parts[0].coords, [
              { x: -115.47093856843338, y: -100.45604562045679, z: 100, m: 5000 },
              { x: -96.13781789606242, y: -110.56875489523543, z: 101, m: 6000 },
              { x: -64.0150943173536, y: -95.39969098306739, z: 102, m: 7000 },
              { x: -42.8973778906099, y: -105.51240025784614, z: 103, m: 8000 },
              { x: -29.215477107085803, y: -93.91252785442344, z: 104, m: 9000 }
            ]);
            break;

          case 1:
            assertPolyLine(geom, i, ShapeType.PolyLineZ, 1);
            assertCoordsXYZM(geom.parts[0].coords, [
              { x: -112.79404493687429, y: -114.43537902970968, z: 1000, m: NaN },
              { x: -89.59430013002913, y: -121.57376204720043, z: 1001, m: NaN },
              { x: -67.88171845182785, y: -109.08159176659149, z: 1002, m: NaN },
              { x: -38.73332113040692, y: -120.0865989185566, z: 1003, m: NaN },
              { x: -23.861689843967667, y: -106.4046981350325, z: 1004, m: NaN }
            ]);
            break;

          case 2:
            assertPolyLine(geom, i, ShapeType.PolyLineZ, 3);
            assertCoordsXYZM(geom.parts[0].coords, [
              { x: -111.60670519384564, y: -126.90578866647462, z: 11, m: 1 },
              { x: -63.80354719030822, y: -139.19802929595573, z: 12, m: 2 },
              { x: -21.12215611572134, y: -115.97935255138037, z: 13, m: 3 }
            ]);

            assertCoordsXYZM(geom.parts[1].coords, [
              { x: -121.85023905174648, y: -133.3933601098118, z: 9, m: 4 },
              { x: -74.38853217680582, y: -147.73430751087312, z: 8, m: 5 },
              { x: -48.77969753205366, y: -146.02705186788958, z: 7, m: 6 },
              { x: -13.951682415190817, y: -121.44257060892755, z: 6, m: 7 }
            ]);
            assertCoordsXYZM(geom.parts[2].coords, [
              { x: -120.14298340876303, y: -147.0514052536797, z: 1.1000000000058208, m: 10 },
              { x: -90.43673522085055, y: -156.61203685438716, z: 1.1999999999970896, m: 20 },
              { x: -69.2667652478554, y: -157.97784136877394, z: 1.3000000000029104, m: 30 },
              { x: -51.16985543223046, y: -155.2462323400004, z: 1.3999999999941792, m: 40 },
              { x: -23.853765144494957, y: -143.6368939677127, z: 1.5, m: 50 },
              { x: -10.195720000627091, y: -131.00320220963494, z: 1.6000000000058208, m: 60 },
              { x: -9.512817743433743, y: -131.3446533382317, z: 1.6000000000058208, m: 70 }
            ]);
            break;
        }
      }
    });
  });
});

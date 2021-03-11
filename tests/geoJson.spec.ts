import { describe, it } from 'mocha';
import { geoJsonAssert } from './util/geoJsonAssert';
import { ShapeType } from '../src/shp/geom/geometry';
import { createAndVerifyReader } from './util/shapeTestUtils';
import { assert } from 'chai';
import { GeoJsonCoord, GeoJsonCoordinateSequence, GeoJsonLineString, GeoJsonMultiPoint, GeoJsonMultiPolygon, GeoJsonPoint, GeoJsonPolygon } from '../src/shp/geom/geoJson';

const tolerance = 0.000000001;

const assertPointsEqual = (p1: GeoJsonCoord, p2: GeoJsonCoord) => {
  assert.closeTo(p1[0], p2[0], tolerance);
  assert.closeTo(p1[1], p2[1], tolerance);
  if (p1.length === 3 && p2.length === 3) {
    assert.closeTo(p1[2], p2[2], tolerance);
  }
};

const assertPolyRingIsSane = (coords: GeoJsonCoordinateSequence, expectedCount: number) => {
  assert.equal(expectedCount, coords.length);
  assertPointsEqual(coords[0], coords[coords.length - 1]);
};

type CoordDim = 2 | 3;

const coordSequenceStringSane = (coords:GeoJsonCoordinateSequence, expectedCoordCount: number, coordDim : CoordDim) => {
  assert.equal(expectedCoordCount, coords.length);
  coords.forEach((p) => assert.equal(coordDim, p.length));
};

describe('GeoJSON serializing', () => {
  describe('GeoJSON from Point', () => {
    it('', async () => {
      const reader = await createAndVerifyReader('point.shp', 'point.shx', ShapeType.Point, 7);
      const point = reader.readGeom(0).toGeoJson() as GeoJsonPoint;
      assert.equal('Point', point.type);
      geoJsonAssert(point);
      assert.equal(2, point.coordinates.length);
    });
  });

  describe('GeoJSON from PointM', () => {
    it('', async () => {
      const reader = await createAndVerifyReader('pointM.shp', 'pointM.shx', ShapeType.PointM, 5);
      const point = reader.readGeom(0).toGeoJson() as GeoJsonPoint;
      assert.equal('Point', point.type);
      geoJsonAssert(point);
      assert.equal(2, point.coordinates.length);
    });
  });

  describe('GeoJSON from PointZM', () => {
    it('', async () => {
      const reader = await createAndVerifyReader('pointZM.shp', 'pointZM.shx', ShapeType.PointZ, 6);
      const point = reader.readGeom(0).toGeoJson() as GeoJsonPoint;
      assert.equal('Point', point.type);
      geoJsonAssert(point);
      assert.equal(3, point.coordinates.length);
    });
  });

  describe('GeoJSON from MultiPoint', () => {
    it('', async () => {
      const reader = await createAndVerifyReader('multipoint.shp', 'multipoint.shx', ShapeType.MultiPoint, 3);
      const mp1 = reader.readGeom(0).toGeoJson() as GeoJsonMultiPoint;
      geoJsonAssert(mp1);
      assert.equal('MultiPoint', mp1.type);
      coordSequenceStringSane(mp1.coordinates, 5, 2);
      geoJsonAssert(reader.readGeom(1).toGeoJson());
      geoJsonAssert(reader.readGeom(2).toGeoJson());
    });
  });

  describe('GeoJSON from MultiPointM', () => {
    it('', async () => {
      const reader = await createAndVerifyReader('multipointM.shp', 'multipointM.shx', ShapeType.MultiPointM, 3);
      const mp1 = reader.readGeom(0).toGeoJson() as GeoJsonMultiPoint;
      assert.equal('MultiPoint', mp1.type);
      coordSequenceStringSane(mp1.coordinates, 5, 2);
      geoJsonAssert(mp1);
      geoJsonAssert(reader.readGeom(1).toGeoJson());
      geoJsonAssert(reader.readGeom(2).toGeoJson());
    });
  });

  describe('GeoJSON from MultiPointZM', () => {
    it('', async () => {
      const reader = await createAndVerifyReader('multipointZM.shp', 'multipointZM.shx', ShapeType.MultiPointZ, 3);
      const mp1 = reader.readGeom(0).toGeoJson() as GeoJsonMultiPoint;
      geoJsonAssert(mp1);
      assert.equal('MultiPoint', mp1.type);
      coordSequenceStringSane(mp1.coordinates, 6, 3);
      geoJsonAssert(reader.readGeom(1).toGeoJson());
      geoJsonAssert(reader.readGeom(2).toGeoJson());
    });
  });

  describe('GeoJSON from PolyLine', () => {
    it('', async () => {
      const reader = await createAndVerifyReader('polyline.shp', 'polyline.shx', ShapeType.PolyLine, 3);
      const pl1 = reader.readGeom(0).toGeoJson() as GeoJsonLineString;
      geoJsonAssert(pl1);
      assert.equal('LineString', pl1.type);
      coordSequenceStringSane(pl1.coordinates, 3, 2);
      geoJsonAssert(reader.readGeom(1).toGeoJson());
      geoJsonAssert(reader.readGeom(2).toGeoJson());
    });
  });

  describe('GeoJSON from PolyLineM', () => {
    it('', async () => {
      const reader = await createAndVerifyReader('polylineM.shp', 'polylineM.shx', ShapeType.PolyLineM, 3);
      const pl1 = reader.readGeom(0).toGeoJson() as GeoJsonLineString;
      geoJsonAssert(pl1);
      assert.equal('LineString', pl1.type);
      coordSequenceStringSane(pl1.coordinates, 3, 2);
      geoJsonAssert(reader.readGeom(1).toGeoJson());
      geoJsonAssert(reader.readGeom(2).toGeoJson());
    });
  });

  describe('GeoJSON from PolyLineZM', () => {
    it('', async () => {
      const reader = await createAndVerifyReader('polylineZM.shp', 'polylineZM.shx', ShapeType.PolyLineZ, 3);
      const pl1 = reader.readGeom(0).toGeoJson() as GeoJsonLineString;
      geoJsonAssert(pl1);
      assert.equal('LineString', pl1.type);
      coordSequenceStringSane(pl1.coordinates, 5, 3);
      geoJsonAssert(reader.readGeom(1).toGeoJson());
      geoJsonAssert(reader.readGeom(2).toGeoJson());
    });
  });

  describe('GeoJSON from Polygon', () => {
    it('', async () => {
      const reader = await createAndVerifyReader('polygon.shp', 'polygon.shx', ShapeType.Polygon, 3);

      const poly = reader.readGeom(0).toGeoJson() as GeoJsonPolygon;
      geoJsonAssert(poly);
      assert.equal('Polygon', poly.type);
      assert.equal(3, poly.coordinates.length); // Exterior + 2 interiors
      assertPolyRingIsSane(poly.coordinates[0], 5);
      assertPolyRingIsSane(poly.coordinates[1], 5);
      assertPolyRingIsSane(poly.coordinates[2], 5);

      geoJsonAssert(reader.readGeom(1).toGeoJson());
      // Geometry 3 is a multipolygon, with holes in some islands

      const multiPoly = reader.readGeom(2).toGeoJson() as GeoJsonMultiPolygon;
      // NOTE: The current version of geojsonhint has a bug in polygon orientation checks, wait for new version
      // geoJsonAssert(multiPoly);
      console.log(JSON.stringify(multiPoly));

      assert.equal(multiPoly.type, 'MultiPolygon');
      assert.exists(multiPoly.coordinates);
      assert.equal(3, multiPoly.coordinates.length); // 3 polygons

      const poly1 = multiPoly.coordinates[0];
      assert.equal(3, poly1.length);
      assertPolyRingIsSane(poly1[0], 6);
      assertPolyRingIsSane(poly1[1], 5);
      assertPolyRingIsSane(poly1[2], 4);

      const poly2 = multiPoly.coordinates[1];
      assert.equal(1, poly2.length);
      assertPolyRingIsSane(poly2[0], 4);

      const poly3 = multiPoly.coordinates[2];
      assert.equal(2, poly3.length);
      assertPolyRingIsSane(poly3[0], 5);
      assertPolyRingIsSane(poly3[1], 5);
    });
  });

  describe('GeoJSON from PolygonM', () => {
    it('', async () => {
      // eslint-disable-next-line no-unused-vars
      const reader = await createAndVerifyReader('polygonM.shp', 'polygonM.shx', ShapeType.PolygonM, 2);
      // NOTE: The current version of geojsonhint has a bug in polygon orientation checks, wait for new version
      // geoJsonAssert(reader.readGeom(0).toGeoJson());
      // geoJsonAssert(reader.readGeom(1).toGeoJson());
    });
  });

  describe('GeoJSON from PolygonZM', () => {
    it('', async () => {
      // eslint-disable-next-line no-unused-vars
      const reader = await createAndVerifyReader('polygonZM.shp', 'polygonZM.shx', ShapeType.PolygonZ, 2);
      // NOTE: The current version of geojsonhint has a bug in polygon orientation checks, wait for new version
      //   geoJsonAssert(reader.readGeom(0).toGeoJson());
      //   geoJsonAssert(reader.readGeom(1).toGeoJson());
    });
  });
});

import { describe, it, expect } from 'vitest';
import { geoJsonAssert } from './util/geoJsonAssert';
import { ShapeType } from '../src/shp/geom/geometry';
import { createAndVerifyReader } from './util/shapeTestUtils';
import { GeoJsonCoord, GeoJsonCoordinateSequence, GeoJsonLineString, GeoJsonMultiPoint, GeoJsonMultiPolygon, GeoJsonPoint, GeoJsonPolygon } from '../src/shp/geom/geoJson';

const tolerance = 0.000000001;

const assertPointsEqual = (p1: GeoJsonCoord, p2: GeoJsonCoord) => {
  expect(p1[0]).toBeCloseTo(p2[0], 9);
  expect(p1[1]).toBeCloseTo(p2[1], 9);
  if (p1.length === 3 && p2.length === 3) {
    expect(p1[2]).toBeCloseTo(p2[2], 9);
  }
};

const assertPolyRingIsSane = (coords: GeoJsonCoordinateSequence, expectedCount: number) => {
  expect(coords.length).toBe(expectedCount);
  assertPointsEqual(coords[0], coords[coords.length - 1]);
};

type CoordDim = 2 | 3;

const coordSequenceStringSane = (coords:GeoJsonCoordinateSequence, expectedCoordCount: number, coordDim : CoordDim) => {
  expect(coords.length).toBe(expectedCoordCount);
  coords.forEach((p) => expect(p.length).toBe(coordDim));
};

describe('GeoJSON serializing', () => {
  describe('GeoJSON from Point', () => {
    it('', async () => {
      const reader = await createAndVerifyReader('point.shp', 'point.shx', ShapeType.Point, 7);
      const point = reader.readGeom(0).toGeoJson() as GeoJsonPoint;
      expect(point.type).toBe('Point');
      geoJsonAssert(point);
      expect(point.coordinates.length).toBe(2);
    });
  });

  describe('GeoJSON from PointM', () => {
    it('', async () => {
      const reader = await createAndVerifyReader('pointM.shp', 'pointM.shx', ShapeType.PointM, 5);
      const point = reader.readGeom(0).toGeoJson() as GeoJsonPoint;
      expect(point.type).toBe('Point');
      geoJsonAssert(point);
      expect(point.coordinates.length).toBe(2);
    });
  });

  describe('GeoJSON from PointZM', () => {
    it('', async () => {
      const reader = await createAndVerifyReader('pointZM.shp', 'pointZM.shx', ShapeType.PointZ, 6);
      const point = reader.readGeom(0).toGeoJson() as GeoJsonPoint;
      expect(point.type).toBe('Point');
      geoJsonAssert(point);
      expect(point.coordinates.length).toBe(3);
    });
  });

  describe('GeoJSON from MultiPoint', () => {
    it('', async () => {
      const reader = await createAndVerifyReader('multipoint.shp', 'multipoint.shx', ShapeType.MultiPoint, 3);
      const mp1 = reader.readGeom(0).toGeoJson() as GeoJsonMultiPoint;
      geoJsonAssert(mp1);
      expect(mp1.type).toBe('MultiPoint');
      coordSequenceStringSane(mp1.coordinates, 5, 2);
      geoJsonAssert(reader.readGeom(1).toGeoJson());
      geoJsonAssert(reader.readGeom(2).toGeoJson());
    });
  });

  describe('GeoJSON from MultiPointM', () => {
    it('', async () => {
      const reader = await createAndVerifyReader('multipointM.shp', 'multipointM.shx', ShapeType.MultiPointM, 3);
      const mp1 = reader.readGeom(0).toGeoJson() as GeoJsonMultiPoint;
      expect(mp1.type).toBe('MultiPoint');
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
      expect(mp1.type).toBe('MultiPoint');
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
      expect(pl1.type).toBe('LineString');
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
      expect(pl1.type).toBe('LineString');
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
      expect(pl1.type).toBe('LineString');
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
      expect(poly.type).toBe('Polygon');
      expect(poly.coordinates.length).toBe(3); // Exterior + 2 interiors
      assertPolyRingIsSane(poly.coordinates[0], 5);
      assertPolyRingIsSane(poly.coordinates[1], 5);
      assertPolyRingIsSane(poly.coordinates[2], 5);

      geoJsonAssert(reader.readGeom(1).toGeoJson());
      // Geometry 3 is a multipolygon, with holes in some islands

      const multiPoly = reader.readGeom(2).toGeoJson() as GeoJsonMultiPolygon;
      geoJsonAssert(multiPoly);

      expect(multiPoly.type).toBe('MultiPolygon');
      expect(multiPoly.coordinates).toBeDefined();
      expect(multiPoly.coordinates.length).toBe(3); // 3 polygons

      const poly1 = multiPoly.coordinates[0];
      expect(poly1.length).toBe(3);
      assertPolyRingIsSane(poly1[0], 6);
      assertPolyRingIsSane(poly1[1], 5);
      assertPolyRingIsSane(poly1[2], 4);

      const poly2 = multiPoly.coordinates[1];
      expect(poly2.length).toBe(1);
      assertPolyRingIsSane(poly2[0], 4);

      const poly3 = multiPoly.coordinates[2];
      expect(poly3.length).toBe(2);
      assertPolyRingIsSane(poly3[0], 5);
      assertPolyRingIsSane(poly3[1], 5);
    });
  });

  describe('GeoJSON from PolygonM', () => {
    it('', async () => {
      const reader = await createAndVerifyReader('polygonM.shp', 'polygonM.shx', ShapeType.PolygonM, 2);
      geoJsonAssert(reader.readGeom(0).toGeoJson());
      geoJsonAssert(reader.readGeom(1).toGeoJson());
    });
  });

  describe('GeoJSON from PolygonZM', () => {
    it('', async () => {
      const reader = await createAndVerifyReader('polygonZM.shp', 'polygonZM.shx', ShapeType.PolygonZ, 2);
      geoJsonAssert(reader.readGeom(0).toGeoJson());
      geoJsonAssert(reader.readGeom(1).toGeoJson());
    });
  });
});

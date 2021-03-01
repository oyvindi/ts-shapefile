import { describe, it } from 'mocha';
import { geoJsonAssert } from './util/geoJsonAssert';
import { ShapeType } from '../src/shp/geom/geometry';
import { createAndVerifyReader } from './util/shapeTestUtils';

describe('GeoJSON serializing', () => {
  describe('GeoJSON from Point', () => {
    it('', async () => {
      const reader = await createAndVerifyReader('point.shp', 'point.shx', ShapeType.Point, 7);
      geoJsonAssert(reader.readGeom(0).toGeoJson());
    });
  });

  describe('GeoJSON from PointM', () => {
    it('', async () => {
      const reader = await createAndVerifyReader('pointM.shp', 'pointM.shx', ShapeType.PointM, 5);
      geoJsonAssert(reader.readGeom(0).toGeoJson());
    });
  });

  describe('GeoJSON from PointZM', () => {
    it('', async () => {
      const reader = await createAndVerifyReader('pointZM.shp', 'pointZM.shx', ShapeType.PointZ, 6);
      geoJsonAssert(reader.readGeom(0).toGeoJson());
    });
  });

  describe('GeoJSON from MultiPoint', () => {
    it('', async () => {
      const reader = await createAndVerifyReader('multipoint.shp', 'multipoint.shx', ShapeType.MultiPoint, 3);
      geoJsonAssert(reader.readGeom(0).toGeoJson());
      geoJsonAssert(reader.readGeom(1).toGeoJson());
      geoJsonAssert(reader.readGeom(2).toGeoJson());
    });
  });

  describe('GeoJSON from MultiPointM', () => {
    it('', async () => {
      const reader = await createAndVerifyReader('multipointM.shp', 'multipointM.shx', ShapeType.MultiPointM, 3);
      geoJsonAssert(reader.readGeom(0).toGeoJson());
      geoJsonAssert(reader.readGeom(1).toGeoJson());
      geoJsonAssert(reader.readGeom(2).toGeoJson());
    });
  });

  describe('GeoJSON from MultiPointZM', () => {
    it('', async () => {
      const reader = await createAndVerifyReader('multipointZM.shp', 'multipointZM.shx', ShapeType.MultiPointZ, 3);
      geoJsonAssert(reader.readGeom(0).toGeoJson());
      geoJsonAssert(reader.readGeom(1).toGeoJson());
      geoJsonAssert(reader.readGeom(2).toGeoJson());
    });
  });

  describe('GeoJSON from PolyLine', () => {
    it('', async () => {
      const reader = await createAndVerifyReader('polyline.shp', 'polyline.shx', ShapeType.PolyLine, 3);
      geoJsonAssert(reader.readGeom(0).toGeoJson());
      geoJsonAssert(reader.readGeom(1).toGeoJson());
      geoJsonAssert(reader.readGeom(2).toGeoJson());
    });
  });

  describe('GeoJSON from PolyLineM', () => {
    it('', async () => {
      const reader = await createAndVerifyReader('polylineM.shp', 'polylineM.shx', ShapeType.PolyLineM, 3);
      geoJsonAssert(reader.readGeom(0).toGeoJson());
      geoJsonAssert(reader.readGeom(1).toGeoJson());
      geoJsonAssert(reader.readGeom(2).toGeoJson());
    });
  });

  describe('GeoJSON from PolyLineZM', () => {
    it('', async () => {
      const reader = await createAndVerifyReader('polylineZM.shp', 'polylineZM.shx', ShapeType.PolyLineZ, 3);
      geoJsonAssert(reader.readGeom(0).toGeoJson());
      geoJsonAssert(reader.readGeom(1).toGeoJson());
      geoJsonAssert(reader.readGeom(2).toGeoJson());
    });
  });

  describe('GeoJSON from Polygon', () => {
    it('', async () => {
      const reader = await createAndVerifyReader('polygon.shp', 'polygon.shx', ShapeType.Polygon, 3);

      geoJsonAssert(reader.readGeom(0).toGeoJson());
      geoJsonAssert(reader.readGeom(1).toGeoJson());
      // NOTE: The current version of geojsonhint has a bug in polygon orientation checks, wait for new version
      // geoJsonAssert(reader.readGeom(2).toGeoJson());
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

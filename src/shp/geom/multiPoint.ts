import { Coordinate } from './coordinate';
import { ShapeType, ShpGeometryBase } from './geometry';
import { GeoJsonGeom } from './geoJson';

export type ShpMultiPointType = ShapeType.MultiPoint | ShapeType.MultiPointZ | ShapeType.MultiPointM;

export class ShpMultiPoint extends ShpGeometryBase {
  readonly points: Array<Coordinate> = [];

  public toGeoJson(): GeoJsonGeom {
    return {
      type: 'MultiPoint',
      coordinates: this.points.map((p) => p.toGeoJson())
    };
  }
}

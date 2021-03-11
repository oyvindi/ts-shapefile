import { Coordinate } from './coordinate';
import { ShapeType, ShpGeometryBase } from './geometry';
import { GeoJsonGeom, GeoJsonPoint } from './geoJson';

export type ShpPointType = ShapeType.Point | ShapeType.PointZ | ShapeType.PointM;

export class ShpPoint extends ShpGeometryBase {
  private _point: Coordinate;

  public get x() {
    return this._point.x;
  }

  public get y(): number {
    return this._point.y;
  }

  public get z(): number {
    return this._point.z;
  }

  public get m(): number {
    return this._point.m;
  }

  constructor(type: ShpPointType, coord: Coordinate) {
    super(type);
    this._point = coord;
  }

  public toGeoJson(): GeoJsonGeom {
    return <GeoJsonPoint> {
      type: 'Point',
      coordinates: this._point.toGeoJson()
    };
  }
}

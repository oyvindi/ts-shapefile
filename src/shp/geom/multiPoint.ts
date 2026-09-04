import { Coordinate } from './coordinate';
import { ShapeType, ShpGeometryBase } from './geometry';
import { Geometry, MultiPoint } from './geoJson';
import { coordToWkt, wktDimSuffix } from './wkt';

export type ShpMultiPointType = ShapeType.MultiPoint | ShapeType.MultiPointZ | ShapeType.MultiPointM;

export class ShpMultiPoint extends ShpGeometryBase {
  readonly points: Array<Coordinate> = [];

  public toGeoJson(): Geometry {
    return <MultiPoint>{
      type: 'MultiPoint',
      coordinates: this.points.map((p) => p.toGeoJson())
    };
  }

  public toWkt(): string {
    if (this.points.length === 0) {
      return `MULTIPOINT${wktDimSuffix(this.hasZ, this.hasM)} EMPTY`;
    }
    const coords = this.points.map((p) => `(${coordToWkt(p)})`).join(', ');
    return `MULTIPOINT${wktDimSuffix(this.hasZ, this.hasM)} (${coords})`;
  }
}

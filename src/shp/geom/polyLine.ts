import { Coordinate } from './coordinate';
import { ShpGeometryBase, ShapeType } from './geometry';
import { Geometry, Position, LineString as GeoJsonLineString, MultiLineString } from './geoJson';
import { coordsToWkt, wktDimSuffix } from './wkt';

export class LineString {
  readonly coords: Array<Coordinate> = [];

  public toJson(): number[][] {
    return this.coords.map((coord) => coord.toJson());
  }

  public toGeoJson(): Position[] {
    return this.coords.map((coord) => coord.toGeoJson());
  }

  public toWkt(): string {
    return coordsToWkt(this.coords);
  }
}

export type ShpPolylineType = ShapeType.PolyLine | ShapeType.PolyLineZ | ShapeType.PolyLineM;

export class ShpPolyLine extends ShpGeometryBase {
  readonly parts: Array<LineString>;

  constructor(type: ShpPolylineType, parts: Array<LineString>) {
    super(type);
    this.parts = parts;
  }

  public toGeoJson(): Geometry {
    if (this.parts.length === 0) {
      return <GeoJsonLineString>{
        type: 'LineString',
        coordinates: []
      };
    }
    if (this.parts.length < 2) {
      return <GeoJsonLineString>{
        type: 'LineString',
        coordinates: this.parts[0].toGeoJson()
      };
    }
    return <MultiLineString>{
      type: 'MultiLineString',
      coordinates: this.parts.map((p) => p.toGeoJson())
    };
  }

  public toWkt(): string {
    const suffix = wktDimSuffix(this.hasZ, this.hasM);
    if (this.parts.length === 0) {
      return `LINESTRING${suffix} EMPTY`;
    }
    if (this.parts.length < 2) {
      return `LINESTRING${suffix} ${this.parts[0].toWkt()}`;
    }
    const parts = this.parts.map((p) => p.toWkt()).join(', ');
    return `MULTILINESTRING${suffix} (${parts})`;
  }
}

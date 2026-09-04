import { Coordinate } from './coordinate';
import { ShpGeometryBase, ShapeType } from './geometry';
import { Geometry, Position, LineString as GeoJsonLineString, MultiLineString } from './geoJson';

export class LineString {
  readonly coords: Array<Coordinate> = [];

  public toJson(): number[][] {
    return this.coords.map((coord) => coord.toJson());
  }

  public toGeoJson(): Position[] {
    return this.coords.map((coord) => coord.toGeoJson());
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
}

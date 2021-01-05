import { Coordinate } from "./coordinate";
import { ShpGeometryBase, ShapeType } from "./geometry";
import { GeoJsonType, GeoJsonGeom } from "./geoJson";

export class LineString {
  readonly coords: Array<Coordinate> = new Array<Coordinate>();

  public toJson(): Coordinate[] {
    return this.coords.map((coord) => coord.toJson());
  }

  public toGeoJson(): Coordinate[] {
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

  public toGeoJson(): GeoJsonGeom {
    let geomType: GeoJsonType = this.parts.length > 1 ? "MultiLineString" : "LineString";
    let coords: Array<any> = [];
    if (this.parts.length == 1) {
      coords = this.parts[0].toGeoJson();
    } else if (this.parts.length > 1) {
      this.parts.forEach((lineString) => coords.push(lineString.toGeoJson()));
    }
    return {
      type: geomType,
      coordinates: coords,
    };
  }
}

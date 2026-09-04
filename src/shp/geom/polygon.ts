import { Coordinate } from './coordinate';
import { ShapeType, ShpGeometryBase } from './geometry';
import { Geometry, Position, MultiPolygon, Polygon } from './geoJson';
import { LineString } from './polyLine';
import { coordsToWkt, wktDimSuffix } from './wkt';

export class LinerarRing extends LineString {
  public area(): number {
    if (this.coords.length < 4) return 0;
    const coords = this.coords;
    let i = 0;
    let area = coords[coords.length - 1].y * coords[0].x - coords[coords.length - 1].x * coords[0].y;
    while (++i < coords.length) {
      area += coords[i - 1].y * coords[i].x - coords[i - 1].x * coords[i].y;
    }
    return area;
  }

  public isClockWise(): boolean {
    return this.area() > 0;
  }

  public containsPoint(point: Coordinate): boolean {
    let inside: boolean = false;
    const coords = this.coords;
    for (let i = 0, j = coords.length - 1; i < coords.length; j = i++) {
      if (
        coords[i].y > point.y !== coords[j].y > point.y &&
        point.x < ((coords[j].x - coords[i].x) * (point.y - coords[i].y)) / (coords[j].y - coords[i].y) + coords[i].x
      ) {
        inside = !inside;
      }
    }
    return inside;
  }

  public contains(other: LinerarRing): boolean {
    for (let i = 0; i < other.coords.length; i++) {
      if (this.containsPoint(other.coords[i])) {
        return true;
      }
    }
    return false;
  }

  public toGeoJson(): Position[] {
    const json = this.coords.map((coord) => coord.toGeoJson());
    json.reverse();
    return json;
  }

  public toWkt(): string {
    const reversed = [...this.coords].reverse();
    return coordsToWkt(reversed);
  }
}

export class ShpPolygonPart {
  readonly exteriorRing: LinerarRing;
  readonly interiorRings: Array<LinerarRing> = [];

  constructor(exterior: LinerarRing) {
    this.exteriorRing = exterior;
  }

  // Converts the part to a GeoJSON ring collection
  public toJson(): Position[][] {
    const res: Position[][] = [];
    // GeoJSON follows the "right hand rule", where exterior rings are
    // counter-clockwise, and interiors clockwise. Therefore we reverse() them.
    res.push(this.exteriorRing.toGeoJson());
    for (const ring of this.interiorRings) {
      res.push(ring.toGeoJson());
    }
    return res;
  }

  // Converts the part to a standalone GeoJSON polygon
  public toGeoJson(): Geometry {
    const rings: Position[][] = [];
    rings.push(this.exteriorRing.toGeoJson());
    rings.push(...this.interiorRings.map((r) => r.toGeoJson()));
    return <Polygon>{
      type: 'Polygon',
      coordinates: rings
    };
  }

  // Converts the part to a WKT ring group, e.g. "((exterior), (interior1), ...)"
  public toWkt(): string {
    const rings = [this.exteriorRing.toWkt(), ...this.interiorRings.map((r) => r.toWkt())];
    return `(${rings.join(', ')})`;
  }
}

export type ShpPolygonType = ShapeType.Polygon | ShapeType.PolygonZ | ShapeType.PolygonM;

export class ShpPolygon extends ShpGeometryBase {
  readonly parts: Array<ShpPolygonPart> = [];

  public toGeoJson(): Geometry {
    if (this.parts.length > 1) {
      return <MultiPolygon>{
        type: 'MultiPolygon',
        coordinates: this.parts.map((part) => part.toJson())
      };
    }
    if (this.parts.length === 0) {
      return <Polygon>{
        type: 'Polygon',
        coordinates: []
      };
    }
    return <Polygon>{
      type: 'Polygon',
      coordinates: this.parts[0].toJson()
    };
  }

  public toWkt(): string {
    const suffix = wktDimSuffix(this.hasZ, this.hasM);
    if (this.parts.length === 0) {
      return `POLYGON${suffix} EMPTY`;
    }
    if (this.parts.length > 1) {
      const parts = this.parts.map((p) => p.toWkt()).join(', ');
      return `MULTIPOLYGON${suffix} (${parts})`;
    }
    return `POLYGON${suffix} ${this.parts[0].toWkt()}`;
  }
}

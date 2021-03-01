import { Coordinate } from "./coordinate";
import { ShapeType, ShpGeometryBase } from "./geometry";
import { GeoJsonType, GeoJsonGeom, GeoJsonCoordinateSequence } from "./geoJson";
import { LineString } from "./polyLine";

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
        coords[i].y > point.y != coords[j].y > point.y &&
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

  public toGeoJson(): GeoJsonCoordinateSequence {
    let json = this.coords.map((coord) => coord.toGeoJson());
    json.reverse();
    return json;
  }
}

export class ShpPolygonPart {
  readonly exteriorRing: LinerarRing;
  readonly interiorRings: Array<LinerarRing> = new Array<LinerarRing>();

  constructor(exterior: LinerarRing) {
    this.exteriorRing = exterior;
  }

  // Converts the part to a GeoJSON ring collection
  public toJson(): Array<GeoJsonCoordinateSequence> {
    const res = [];
    // GeoJSON follows the "right hand rule", where exterior rings are
    // counter-clockwise, and interiors clockwise. Therefore we reverse() them.
    res.push(this.exteriorRing.toGeoJson());
    this.interiorRings.forEach((ring) => res.push(ring.toGeoJson()));
    return res;
  }

  // Converts the part to a standalone GeoJSON polygon
  public toGeoJson(): GeoJsonGeom {
    const rings = new Array<GeoJsonCoordinateSequence>();
    rings.push(this.exteriorRing.toGeoJson());
    rings.concat(this.interiorRings.map((r)=> r.toGeoJson()));
    return {
      type : "Polygon",
      coordinates : rings
    }
  }
}

export type ShpPolygonType = ShapeType.Polygon | ShapeType.PolygonZ | ShapeType.PolygonM;

export class ShpPolygon extends ShpGeometryBase {
  readonly parts: Array<ShpPolygonPart> = new Array<ShpPolygonPart>();

  constructor(type: ShpPolygonType) {
    super(type);
  }

  public toGeoJson(): GeoJsonGeom {
    let coords = new Array<GeoJsonCoordinateSequence>();
    let geomType: GeoJsonType;

    if (this.parts.length > 1) {
      geomType = "MultiPolygon";
      this.parts.forEach((part) => coords.concat(part.toJson()));
    } else {
      geomType = "Polygon";
      coords = this.parts[0].toJson();
    }
    return {
      type: geomType,
      coordinates: coords,
    };
  }
}

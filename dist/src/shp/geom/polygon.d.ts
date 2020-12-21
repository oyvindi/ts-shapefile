import { Coordinate } from "./coordinate";
import { ShapeType, ShpGeometryBase } from "./geometry";
import { GeoJsonGeom } from "./geoJson";
import { LineString } from "./polyLine";
export declare class LinerarRing extends LineString {
    area(): number;
    isClockWise(): boolean;
    containsPoint(point: Coordinate): boolean;
    contains(other: LinerarRing): boolean;
    toGeoJson(): Coordinate[];
}
export declare class ShpPolygonPart {
    readonly exteriorRing: LinerarRing;
    readonly interiorRings: Array<LinerarRing>;
    constructor(exterior: LinerarRing);
    toJson(): any[];
}
export declare type ShpPolygonType = ShapeType.Polygon | ShapeType.PolygonZ | ShapeType.PolygonM;
export declare class ShpPolygon extends ShpGeometryBase {
    readonly parts: Array<ShpPolygonPart>;
    constructor(type: ShpPolygonType);
    toGeoJson(): GeoJsonGeom;
}

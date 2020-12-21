import { Coordinate } from "./coordinate";
import { ShapeType, ShpGeometryBase } from "./geometry";
import { GeoJsonGeom } from "./geoJson";
export declare type ShpMultiPointType = ShapeType.MultiPoint | ShapeType.MultiPointZ | ShapeType.MultiPointM;
export declare class ShpMultiPoint extends ShpGeometryBase {
    readonly points: Coordinate[];
    constructor(type: ShpMultiPointType);
    toGeoJson(): GeoJsonGeom;
}

import { Coordinate } from "./coordinate";
import { ShapeType, ShpGeometryBase } from "./geometry";
import { GeoJsonGeom } from "./geoJson";
export declare type ShpPointType = ShapeType.Point | ShapeType.PointZ | ShapeType.PointM;
export declare class ShpPoint extends ShpGeometryBase {
    private _point;
    get x(): number;
    get y(): number;
    get z(): number;
    get m(): number;
    constructor(type: ShpPointType, coord: Coordinate);
    toGeoJson(): GeoJsonGeom;
}

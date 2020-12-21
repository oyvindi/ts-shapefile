import { CoordType } from "./coordinate";
import { GeoJsonGeom } from "./geoJson";
export declare enum ShapeType {
    Null = 0,
    Point = 1,
    PolyLine = 3,
    Polygon = 5,
    MultiPoint = 8,
    PointZ = 11,
    PolyLineZ = 13,
    PolygonZ = 15,
    MultiPointZ = 18,
    PointM = 21,
    PolyLineM = 23,
    PolygonM = 25,
    MultiPointM = 28
}
export declare class GeomUtil {
    static pointType(shapeType: ShapeType): CoordType;
    static hasZ(shapeType: ShapeType): boolean;
    static hasM(shapeType: ShapeType): boolean;
    static shapeTypeStr(shapeType: ShapeType): string;
}
export interface ShpGeometry {
    type: ShapeType;
    toGeoJson(): GeoJsonGeom;
    readonly hasZ: boolean;
    readonly hasM: boolean;
}
export declare abstract class ShpGeometryBase implements ShpGeometry {
    readonly type: ShapeType;
    readonly hasZ: boolean;
    readonly hasM: boolean;
    constructor(type: ShapeType);
    abstract toGeoJson(): GeoJsonGeom;
}

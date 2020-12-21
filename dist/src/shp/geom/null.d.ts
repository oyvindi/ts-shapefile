import { ShpGeometryBase } from "./geometry";
import { GeoJsonGeom } from "./geoJson";
export declare class ShpNullGeom extends ShpGeometryBase {
    toGeoJson(): GeoJsonGeom;
}

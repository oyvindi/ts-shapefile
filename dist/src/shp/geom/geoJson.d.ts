export declare type GeoJsonType = "Point" | "LineString" | "Polygon" | "MultiPoint" | "MultiLineString" | "MultiPolygon";
export interface GeoJsonObject {
    readonly type: string;
}
export interface GeoJsonGeom extends GeoJsonObject {
    type: GeoJsonType;
    coordinates: any[];
}
export interface GeoJsonFeature extends GeoJsonObject {
    readonly type: "Feature";
    geometry: GeoJsonGeom;
    properties: Object;
}
export interface GeoJsonFeatureCollection extends GeoJsonObject {
    readonly type: "FeatureCollection";
    features: Array<GeoJsonFeature>;
}

export type GeoJsonType = "Point" | "LineString" | "Polygon" | "MultiPoint" | "MultiLineString" | "MultiPolygon";

export interface GeoJsonObject {
  readonly type: string;
}

export type GeoJsonCoordXY = [number, number];
export type GeoJsonCoordXYZ = [number, number, number];

export type GeoJsonCoordinateSequence = Array<GeoJsonCoordXY | GeoJsonCoordXYZ>;

export interface GeoJsonGeom extends GeoJsonObject {
  type: GeoJsonType;
  coordinates: Array<GeoJsonCoordinateSequence>;
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

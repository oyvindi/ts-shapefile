export type GeoJsonType = 'Point' | 'LineString' | 'Polygon' | 'MultiPoint' | 'MultiLineString' | 'MultiPolygon';

export interface GeoJsonObject {
  readonly type: string;
}

export type GeoJsonCoordXY = [number, number];
export type GeoJsonCoordXYZ = [number, number, number];

export type GeoJsonCoord = GeoJsonCoordXY | GeoJsonCoordXYZ;

export type GeoJsonCoordinateSequence = Array<GeoJsonCoord>;

export interface GeoJsonGeom extends GeoJsonObject {
  type: GeoJsonType;
}

export interface GeoJsonPoint extends GeoJsonGeom {
  coordinates: GeoJsonCoord;
}

export interface GeoJsonMultiPoint extends GeoJsonGeom {
  coordinates: GeoJsonCoordinateSequence;
}

export interface GeoJsonLineString extends GeoJsonGeom {
  coordinates: GeoJsonCoordinateSequence;
}

export interface GeoJsonMultiLineString extends GeoJsonGeom {
  coordinates: Array<GeoJsonCoordinateSequence>;
}

export interface GeoJsonPolygon extends GeoJsonGeom {
  coordinates: Array<GeoJsonCoordinateSequence>;
}

export interface GeoJsonMultiPolygon extends GeoJsonGeom {
  coordinates: Array<Array<GeoJsonCoordinateSequence>>;
}

export interface GeoJsonFeature extends GeoJsonObject {
  readonly type: 'Feature';
  geometry: GeoJsonGeom;
  properties: Object;
}

export interface GeoJsonFeatureCollection extends GeoJsonObject {
  readonly type: 'FeatureCollection';
  features: Array<GeoJsonFeature>;
}

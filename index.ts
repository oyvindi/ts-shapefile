import { type } from "os";

export * from "./src/shapeFeature";
export * from "./src/shapeFeatureReader";
export * from "./src/shp/geom/geometry";
export * from "./src/shp/geom/geoJson";
export * from "./src/shp/shapeReader";
export * from "./src/dbf/dbfReader";
export * from "./src/dbf/dbfTypes";
export type { LinerarRing, ShpPolygon } from "./src/shp/geom/polygon";
export type { LineString, ShpPolyLine } from "./src/shp/geom/polyLine";
export type { ShpPoint } from "./src/shp/geom/point";
export type { ShpHeader } from "./src/shp/shapeTypes";

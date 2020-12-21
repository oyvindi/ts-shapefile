import { DbfFieldDescr } from "./dbf/dbfTypes";
import { GeoJsonFeature, GeoJsonFeatureCollection } from "./shp/geom/geoJson";
import { ShpGeometry } from "./shp/geom/geometry";
export declare class ShapeFeature {
    private _fields;
    readonly geom: ShpGeometry;
    readonly attrs: Array<any>;
    constructor(geom: ShpGeometry, attributes?: Array<any>, fieldInfo?: Array<DbfFieldDescr>);
    toGeoJson(): GeoJsonFeature;
}
export declare class ShapeFeatureCollection {
    private _fields;
    private _features;
    get fields(): Array<DbfFieldDescr>;
    get features(): Array<ShapeFeature>;
    constructor(fields?: Array<DbfFieldDescr>);
    toGeoJson(): GeoJsonFeatureCollection;
}

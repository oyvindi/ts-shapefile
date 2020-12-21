import { ShpHeader } from "./shp/shapeTypes";
import { ShapeFeature, ShapeFeatureCollection } from "./shapeFeature";
import { DbfFieldDescr } from "./dbf/dbfTypes";
export declare class ShapeFeatureReader {
    private _shpReader;
    private _dbfReader;
    get featureCount(): number;
    get fields(): Array<DbfFieldDescr>;
    get shpHeader(): ShpHeader;
    private constructor();
    static fromArrayBuffers(shp: ArrayBuffer, shx: ArrayBuffer, dbf?: ArrayBuffer, cpg?: ArrayBuffer): Promise<ShapeFeatureReader>;
    static fromFiles(shp: File, shx: File, dbf?: File, cpg?: File): Promise<ShapeFeatureReader>;
    readFeature(index: number): ShapeFeature;
    readFeatureCollection(): ShapeFeatureCollection;
}

import { ShapeType, ShpGeometry } from "./geom/geometry";
import { BoundingBox, ShpHeader } from "./shapeTypes";
export declare class ShapeReader {
    private _shxStream;
    private _shpStream;
    private _shxHeader;
    private _shpHeader;
    readonly recordCount: number;
    readonly hasZ: boolean;
    readonly hasM: boolean;
    get extent(): BoundingBox;
    get shapeType(): ShapeType;
    get shpHeader(): ShpHeader;
    private constructor();
    static fromFile(shp: File, shx: File): Promise<ShapeReader>;
    static fromArrayBuffer(shpBytes: ArrayBuffer, shxBytes: ArrayBuffer): Promise<ShapeReader>;
    private _readHeader;
    private _readGeomHeader;
    private _readBbox;
    private _readPartsInfo;
    private _checkMeasureNaN;
    private _readParts;
    private _getShpIndex;
    readGeom(geomIndex: number): ShpGeometry;
    private _readPoint;
    private _readMultiPoint;
    private _readPolyLine;
    private _readPolygon;
}

import { ShpHeader } from './shp/shapeTypes';
import { ShapeReader } from './shp/shapeReader';
import { ShapeFeature, ShapeFeatureCollection } from './shapeFeature';
import { DbfReader } from './dbf/dbfReader';
import { DbfFieldDescr } from './dbf/dbfTypes';

export class ShapeFeatureReader {
  private _shpReader: ShapeReader;
  private _dbfReader?: DbfReader;

  public get featureCount(): number {
    return this._shpReader!.recordCount;
  }

  public get fields(): Array<DbfFieldDescr> {
    return this._dbfReader!.fields;
  }

  public get shpHeader(): ShpHeader {
    return this._shpReader!.shpHeader;
  }

  private constructor(shapeFile: ShapeReader, dbfReader?: DbfReader) {
    if (shapeFile.recordCount !== dbfReader?.recordCount) {
      throw new Error(
        `Record count mismatch: SHP-file has ${shapeFile.recordCount} records, DBF has ${dbfReader?.recordCount}`
      );
    }
    this._shpReader = shapeFile;
    this._dbfReader = dbfReader;
  }

  public static async fromArrayBuffers(
    shp: ArrayBuffer,
    shx: ArrayBuffer,
    dbf?: ArrayBuffer,
    cpg?: ArrayBuffer
  ): Promise<ShapeFeatureReader> {
    if (shp == null) {
      throw new Error('No .shp buffer provided');
    }
    if (shx == null) {
      throw new Error('No .shx buffer provided');
    }
    const shapeReader = await ShapeReader.fromArrayBuffer(shp, shx);
    let dbfReader: DbfReader | undefined;
    if (dbf != null) {
      dbfReader = await DbfReader.fromArrayBuffer(dbf, cpg);
    }
    return new ShapeFeatureReader(shapeReader, dbfReader);
  }

  public static async fromFiles(shp: File, shx: File, dbf?: File, cpg?: File): Promise<ShapeFeatureReader> {
    if (shp == null) {
      throw new Error('No .shp file provided');
    }
    if (shx == null) {
      throw new Error('No .shx file provided');
    }
    const shapeReader = await ShapeReader.fromFile(shp, shx);
    let dbfReader: DbfReader | undefined;
    if (dbf != null) {
      dbfReader = await DbfReader.fromFile(dbf, cpg);
    }
    return new ShapeFeatureReader(shapeReader, dbfReader);
  }

  public readFeature(index: number): ShapeFeature {
    if (index < 0 || index > this.featureCount - 1) {
      throw new Error('Feature index out of range');
    }
    const geom = this._shpReader!.readGeom(index);
    let attrs: Array<any> = [];
    if (this._dbfReader != null) {
      attrs = this._dbfReader.readRecord(index);
    }
    return new ShapeFeature(geom, attrs, this._dbfReader?.fields);
  }

  public readFeatureCollection(): ShapeFeatureCollection {
    const collection = new ShapeFeatureCollection(this._dbfReader?.fields);
    for (let i = 0; i < this.featureCount; i++) {
      const feature = this.readFeature(i);
      collection.features.push(feature);
    }
    return collection;
  }
}

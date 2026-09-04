import { readFile } from 'node:fs/promises';
import { ShapeFeatureReader } from '../shapeFeatureReader';
import { ShapeReader } from '../shp/shapeReader';
import { DbfReader } from '../dbf/dbfReader';

const swapExt = (filePath: string, ext: string): string =>
  filePath.replace(/\.[^.]+$/, ext);

const readIfExists = async (p: string): Promise<ArrayBuffer | undefined> => {
  try {
    return toArrayBuffer(await readFile(p));
  } catch {
    return undefined;
  }
};

const toArrayBuffer = (buf: Uint8Array): ArrayBuffer => {
  const ab = new ArrayBuffer(buf.byteLength);
  new Uint8Array(ab).set(buf);
  return ab;
};

export class ShapefileFs {
  public static async fromPath(shpPath: string): Promise<ShapeFeatureReader> {
    if (shpPath == null) {
      throw new Error('No .shp path provided');
    }
    const shp = toArrayBuffer(await readFile(shpPath));
    const shxPath = swapExt(shpPath, '.shx');
    let shx: ArrayBuffer;
    try {
      shx = toArrayBuffer(await readFile(shxPath));
    } catch (err) {
      throw new Error(`Failed to open .shx: ${err instanceof Error ? err.message : String(err)}`, { cause: err });
    }
    const dbf = await readIfExists(swapExt(shpPath, '.dbf'));
    const cpg = await readIfExists(swapExt(shpPath, '.cpg'));
    return ShapeFeatureReader.fromArrayBuffers(shp, shx, dbf, cpg);
  }

  public static async fromPathShp(shpPath: string): Promise<ShapeReader> {
    if (shpPath == null) {
      throw new Error('No .shp path provided');
    }
    const shp = toArrayBuffer(await readFile(shpPath));
    const shxPath = swapExt(shpPath, '.shx');
    let shx: ArrayBuffer;
    try {
      shx = toArrayBuffer(await readFile(shxPath));
    } catch (err) {
      throw new Error(`Failed to open .shx: ${err instanceof Error ? err.message : String(err)}`, { cause: err });
    }
    return ShapeReader.fromArrayBuffer(shp, shx);
  }

  public static async fromPathDbf(dbfPath: string): Promise<DbfReader> {
    if (dbfPath == null) {
      throw new Error('No .dbf path provided');
    }
    const dbf = toArrayBuffer(await readFile(dbfPath));
    const cpg = await readIfExists(swapExt(dbfPath, '.cpg'));
    return DbfReader.fromArrayBuffer(dbf, cpg);
  }
}

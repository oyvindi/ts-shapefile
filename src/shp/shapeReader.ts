import { Coordinate, CoordXY, CoordXYM, CoordXYZM } from './geom/coordinate';
import { ShpPointType, ShpPoint } from './geom/point';
import { ShpMultiPointType, ShpMultiPoint } from './geom/multiPoint';
import { LinerarRing, ShpPolygonType, ShpPolygon, ShpPolygonPart } from './geom/polygon';
import { ShpNullGeom } from './geom/null';
import { GeomUtil, ShapeType, ShpGeometry } from './geom/geometry';
import { BoundingBox, GeomHeader, PartsInfo, ShpHeader } from './shapeTypes';
import { MemoryStream } from '../util/memoryStream';
import { ShpPolyLine, LineString, ShpPolylineType } from './geom/polyLine';

// According to Shape spec, M values less than this is NaN
const mNaN = -Math.pow(-10, 38);

export class ShapeReader {
  private _shxStream: MemoryStream;
  private _shpStream: MemoryStream;
  private _shxHeader: ShpHeader;
  private _shpHeader: ShpHeader;

  readonly recordCount: number = 0;

  readonly hasZ: boolean;

  readonly hasM: boolean;

  public get extent(): BoundingBox {
    return this._shpHeader!.extent;
  }

  public get shapeType(): ShapeType {
    return this._shpHeader!.type;
  }

  public get shpHeader(): ShpHeader {
    return this._shpHeader!;
  }

  private constructor(shp: ArrayBuffer, shx: ArrayBuffer) {
    this._shpStream = new MemoryStream(shp);
    this._shpHeader = this._readHeader(this._shpStream);
    this._shxStream = new MemoryStream(shx);
    this._shxHeader = this._readHeader(this._shxStream);
    if (this._shpHeader.type !== this._shxHeader.type) {
      throw new Error('SHP / SHX shapetype mismatch');
    }
    this.recordCount = (this._shxHeader.fileLength - 100) / 8;
    this.hasZ = GeomUtil.hasZ(this._shpHeader.type);
    this.hasM = GeomUtil.hasM(this._shpHeader.type);
  }

  public static async fromFile(shp: File, shx: File): Promise<ShapeReader> {
    if (shp == null) {
      throw new Error('No .shp file provided');
    }
    if (shx == null) {
      throw new Error('No .shx file provided');
    }
    let shpBytes: ArrayBuffer;
    let shxBytes: ArrayBuffer;
    try {
      shpBytes = await shp.arrayBuffer();
    } catch (err) {
      throw new Error(`Failed to open .shp: ${err.message}`);
    }
    try {
      shxBytes = await shx.arrayBuffer();
    } catch (err) {
      throw new Error(`Failed to open .shp: ${err.message}`);
    }
    return this.fromArrayBuffer(shpBytes, shxBytes);
  }

  public static async fromArrayBuffer(shpBytes: ArrayBuffer, shxBytes: ArrayBuffer): Promise<ShapeReader> {
    return new ShapeReader(shpBytes, shxBytes);
  }

  /* Used for both .shp and .shx */
  private _readHeader(stream: MemoryStream): ShpHeader {
    const version = stream.seek(0).readInt32();
    if (version !== 9994) {
      throw new Error('Unexpected Shape version');
    }

    const fileLen = stream.seek(24).readInt32();
    const shpType = stream.seek(32).readInt32(true);
    stream.seek(36);
    const extent = this._readBbox(stream);
    const result = {
      type: shpType as ShapeType,
      fileLength: fileLen * 2,
      extent: extent
    };
    return result;
  }

  private _readGeomHeader(): GeomHeader {
    const recNum = this._shpStream.readInt32(false);
    const len = this._shpStream.readInt32(false);
    const type: ShapeType = this._shpStream.readInt32(true) as ShapeType;
    return {
      length: len,
      recordNum: recNum,
      type: type
    };
  }

  private _readBbox(stream: MemoryStream): BoundingBox {
    const xMin = stream.readDouble(true);
    const yMin = stream.readDouble(true);
    const xMax = stream.readDouble(true);
    const yMax = stream.readDouble(true);
    return {
      xMin: xMin,
      yMin: yMin,
      xMax: xMax,
      yMax: yMax
    };
  }

  private _readPartsInfo(): PartsInfo {
    const numParts = this._shpStream.readInt32(true);
    const numPoints = this._shpStream.readInt32(true);
    const partIndices = this._shpStream.readInt32Array(numParts, true);
    return {
      numParts: numParts,
      numPoints: numPoints,
      index: partIndices
    };
  }

  private _checkMeasureNaN(m: number) {
    if (m < mNaN) {
      return NaN;
    }
    return m;
  }

  private _readParts<TPart extends LineString>(alloc: () => TPart): Array<TPart> {
    // Read bounding box + parts indices
    this._readBbox(this._shpStream); // skip
    const partsInfo = this._readPartsInfo();

    // Read parts / coordinates
    const xy = this._shpStream.readDoubleArray(partsInfo.numPoints * 2, true);
    let zValues: Float64Array | undefined;
    let mValues: Float64Array | undefined;
    if (this.hasZ) {
      this._shpStream.readDouble(true); // skip zMin
      this._shpStream.readDouble(true); // skip zMax
      zValues = this._shpStream.readDoubleArray(partsInfo.numPoints, true);
    }
    if (this.hasM) {
      this._shpStream.readDouble(true); // skip mMin
      this._shpStream.readDouble(true); // skip mMax
      mValues = this._shpStream.readDoubleArray(partsInfo.numPoints, true);
    }

    const parts: Array<TPart> = [];
    for (let partNum = 0; partNum < partsInfo.numParts; partNum++) {
      const startIdx = partsInfo.index[partNum];
      const isLast = partNum === partsInfo.numParts - 1;
      const endIdx = isLast ? partsInfo.numPoints : partsInfo.index[partNum + 1];
      const part = alloc();
      parts.push(part);
      for (let idx = startIdx; idx < endIdx; idx++) {
        const xyIdx = idx * 2;
        if (mValues) {
          const mVal = this._checkMeasureNaN(mValues[idx]);
          if (zValues) {
            part.coords.push(new CoordXYZM(xy[xyIdx], xy[xyIdx + 1], zValues[idx], mVal));
          } else {
            part.coords.push(new CoordXYM(xy[xyIdx], xy[xyIdx + 1], mVal));
          }
        } else {
          part.coords.push(new CoordXY(xy[xyIdx], xy[xyIdx + 1]));
        }
      }
    }
    return parts;
  }

  private _getShpIndex(index: number): number {
    const offs = index * 8 + 100;
    const shpOffset = this._shxStream.seek(offs).readInt32(false) * 2;
    // const contentLen = this._shxStream.readInt32(false) * 2;
    return shpOffset;
  }

  public readGeom(geomIndex: number): ShpGeometry {
    const offset = this._getShpIndex(geomIndex);
    this._shpStream.seek(offset);
    const recHead = this._readGeomHeader();

    if (this._shpHeader.type !== recHead.type) {
      if (recHead.type === ShapeType.Null) {
        return new ShpNullGeom(recHead.type);
      }
      throw new Error(
        `Unexpected shape type ${GeomUtil.shapeTypeStr(recHead.type)}(${recHead.type as number
        }), expected ${GeomUtil.shapeTypeStr(this._shpHeader.type)}`
      );
    }
    switch (recHead.type) {
      case ShapeType.Point:
      case ShapeType.PointZ:
      case ShapeType.PointM:
        return this._readPoint(recHead);

      case ShapeType.MultiPoint:
      case ShapeType.MultiPointZ:
      case ShapeType.MultiPointM:
        return this._readMultiPoint(recHead);

      case ShapeType.PolyLine:
      case ShapeType.PolyLineZ:
      case ShapeType.PolyLineM:
        return this._readPolyLine(recHead);

      case ShapeType.Polygon:
      case ShapeType.PolygonZ:
      case ShapeType.PolygonM:
        return this._readPolygon(recHead);
    }
    throw new Error('Unsupported geometry');
  }

  private _readPoint(header: GeomHeader): ShpPoint {
    const x = this._shpStream.readDouble(true);
    const y = this._shpStream.readDouble(true);
    let coord: Coordinate | undefined;
    if (this.hasM) {
      const z = this.hasZ ? this._shpStream.readDouble(true) : undefined;
      let m = this._shpStream.readDouble(true);
      m = this._checkMeasureNaN(m);
      if (z) {
        coord = new CoordXYZM(x, y, z, m);
      } else {
        coord = new CoordXYM(x, y, m);
      }
    } else {
      coord = new CoordXY(x, y);
    }
    return new ShpPoint(header.type as ShpPointType, coord);
  }

  private _readMultiPoint(header: GeomHeader): ShpGeometry {
    this._readBbox(this._shpStream);
    const numPoints = this._shpStream.readInt32(true);

    // Read parts / coordinates
    const xy = this._shpStream.readDoubleArray(numPoints * 2, true);
    let zValues: Float64Array | undefined;
    let mValues: Float64Array | undefined;
    if (this.hasZ) {
      this._shpStream.readDouble(true); // skip zMin
      this._shpStream.readDouble(true); // skip zMax
      zValues = this._shpStream.readDoubleArray(numPoints, true);
    }
    if (this.hasM) {
      this._shpStream.readDouble(true); // skip mMin
      this._shpStream.readDouble(true); // skip mMax
      mValues = this._shpStream.readDoubleArray(numPoints, true);
    }

    const geom = new ShpMultiPoint(header.type as ShpMultiPointType);
    for (let i = 0; i < numPoints; i++) {
      const xyIdx = i * 2;
      let coord: Coordinate;
      if (mValues) {
        const m = this._checkMeasureNaN(mValues[i]);
        if (zValues) {
          coord = new CoordXYZM(xy[xyIdx], xy[xyIdx + 1], zValues[i], m);
        } else {
          coord = new CoordXYM(xy[xyIdx], xy[xyIdx + 1], m);
        }
      } else {
        coord = new CoordXY(xy[xyIdx], xy[xyIdx + 1]);
      }
      geom.points.push(coord);
    }
    return geom;
  }

  private _readPolyLine(header: GeomHeader): ShpPolyLine {
    const parts = this._readParts(() => new LineString());
    return new ShpPolyLine(header.type as ShpPolylineType, parts);
  }

  private _readPolygon(header: GeomHeader): ShpPolygon {
    const rings = this._readParts(() => new LinerarRing());
    const poly = new ShpPolygon(header.type as ShpPolygonType);

    /* Create parts from exterior rings (clockwise), and sort out holes (counter-clockwise)  */
    const holes: Array<LinerarRing> = [];
    rings.forEach((ring) => {
      if (ring.isClockWise()) {
        const polyPart = new ShpPolygonPart(ring);
        poly.parts.push(polyPart);
      } else {
        holes.push(ring);
      }
    });
    /* Find which exterior rings that contain the holes, and add them to the respective part  */
    holes.forEach((hole) => {
      let found = false;
      poly.parts.forEach((part) => {
        if (part.exteriorRing.contains(hole)) {
          part.interiorRings.push(hole);
          found = true;
        }
      });
      if (!found) {
        console.error('Orphan poly hole');
      }
    });
    return poly;
  }
}

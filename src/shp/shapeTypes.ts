import { ShapeType } from './geom/geometry';

export interface BoundingBox {
  readonly xMin: number;
  readonly yMin: number;
  readonly xMax: number;
  readonly yMax: number;
}

export interface ShpHeader {
  readonly extent: BoundingBox;
  readonly type: ShapeType;
  readonly fileLength: number;
}

export interface ShxRecord {
  offset: number;
  length: number;
}

export interface GeomHeader {
  recordNum: number;
  length: number;
  type: ShapeType;
}

export interface PartsInfo {
  numParts: number;
  numPoints: number;
  index: Int32Array;
}

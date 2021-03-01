import { CoordType } from './coordinate';
import { GeoJsonGeom } from './geoJson';

/* eslint-disable  no-unused-vars */
export enum ShapeType {
  Null = 0,
  Point = 1,
  PolyLine = 3,
  Polygon = 5,
  MultiPoint = 8,
  PointZ = 11,
  PolyLineZ = 13,
  PolygonZ = 15,
  MultiPointZ = 18,
  PointM = 21,
  PolyLineM = 23,
  PolygonM = 25,
  MultiPointM = 28,
}
/* eslint-enable  no-unused-vars */

export class GeomUtil {
  public static pointType(shapeType: ShapeType): CoordType {
    if (shapeType === 0) {
      return CoordType.NULL;
    } else if (shapeType < 10) {
      return CoordType.XY;
    } else if (shapeType < 20) {
      return CoordType.XYZM;
    } else if (shapeType < 30) {
      return CoordType.XYM;
    }
    return CoordType.NULL;
  }

  public static hasZ(shapeType: ShapeType): boolean {
    const type = GeomUtil.pointType(shapeType);
    return type === CoordType.XYZM;
  }

  public static hasM(shapeType: ShapeType): boolean {
    const type = GeomUtil.pointType(shapeType);
    return type === CoordType.XYZM || type === CoordType.XYM;
  }

  public static shapeTypeStr(shapeType: ShapeType): string {
    if (shapeType in ShapeType) {
      return ShapeType[shapeType];
    }
    return 'Unknown';
  }
}

export interface ShpGeometry {
  type: ShapeType;
  toGeoJson(): GeoJsonGeom;
  readonly hasZ: boolean;
  readonly hasM: boolean;
}

export abstract class ShpGeometryBase implements ShpGeometry {
  public readonly type: ShapeType;

  readonly hasZ: boolean;

  readonly hasM: boolean;

  constructor(type: ShapeType) {
    this.type = type;
    const pointType = GeomUtil.pointType(this.type);
    this.hasZ = pointType === CoordType.XYZM;
    this.hasM = pointType === CoordType.XYZM || pointType === CoordType.XYM;
  }

  public abstract toGeoJson(): GeoJsonGeom;
}

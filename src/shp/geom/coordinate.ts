import { GeoJsonCoordXY, GeoJsonCoordXYZ } from './geoJson';

/* eslint-disable  no-unused-vars */
export enum CoordType {
  NULL = 0,
  XY = 2,
  XYM = 3,
  XYZM = 4,
}
/* eslint-enable  no-unused-vars */

export interface Coordinate {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly m: number;

  readonly hasZ: boolean;
  readonly hasM: boolean;
  toJson(): any;
  toGeoJson(): any;
}

abstract class CoordinateBase implements Coordinate {
  abstract x: number;
  abstract y: number;
  abstract z: number;
  abstract m: number;
  abstract hasZ: boolean;
  abstract hasM: boolean;

  public toJson(): any {
    if (this.hasZ) {
      return [this.x, this.y, this.z, this.m];
    }
    if (this.hasM) {
      return [this.x, this.y, this.m];
    }
    return [this.x, this.y];
  }

  public toGeoJson(): GeoJsonCoordXY | GeoJsonCoordXYZ {
    if (this.hasZ) {
      return [this.x, this.y, this.z] as GeoJsonCoordXYZ;
    }
    return [this.x, this.y] as GeoJsonCoordXY;
  }
}

export class CoordXY extends CoordinateBase {
  readonly x: number;
  readonly y: number;

  get z() {
    return NaN;
  }

  get m() {
    return NaN;
  }

  readonly hasZ: boolean = false;
  readonly hasM: boolean = false;

  constructor(x: number, y: number) {
    super();
    this.x = x;
    this.y = y;
  }
}

export class CoordXYM extends CoordinateBase {
  readonly x: number;
  readonly y: number;
  readonly m: number;

  get z() {
    return NaN;
  }

  readonly hasZ: boolean = false;
  readonly hasM: boolean = true;

  constructor(x: number, y: number, m: number) {
    super();
    this.x = x;
    this.y = y;
    this.m = m;
  }
}

export class CoordXYZM extends CoordinateBase {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly m: number;

  readonly hasZ: boolean = true;
  readonly hasM: boolean = true;

  constructor(x: number, y: number, z: number, m: number) {
    super();
    this.x = x;
    this.y = y;
    this.z = z;
    this.m = m;
  }
}

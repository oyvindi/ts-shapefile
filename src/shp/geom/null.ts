import { ShpGeometryBase } from './geometry';
import { Geometry } from './geoJson';

export class ShpNullGeom extends ShpGeometryBase {
  public toGeoJson(): Geometry {
    throw new Error('Not implemented');
  }
}

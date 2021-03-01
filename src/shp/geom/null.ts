import { ShpGeometryBase } from './geometry';
import { GeoJsonGeom } from './geoJson';

export class ShpNullGeom extends ShpGeometryBase {
  public toGeoJson(): GeoJsonGeom {
    throw new Error('Not implemented');
  }
}

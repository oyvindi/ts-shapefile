import { DbfFieldDescr } from "./dbf/dbfTypes";
import { GeoJsonFeature, GeoJsonFeatureCollection } from "./shp/geom/geoJson";
import { ShpGeometry } from "./shp/geom/geometry";

export class ShapeFeature {
  private _fields: Array<DbfFieldDescr> = null;

  readonly geom: ShpGeometry = null;

  readonly attrs: Array<any> = null;

  constructor(geom: ShpGeometry, attributes?: Array<any>, fieldInfo?: Array<DbfFieldDescr>) {
    this.geom = geom;
    this.attrs = attributes;
    this._fields = fieldInfo;
  }

  public toGeoJson(): GeoJsonFeature {
    let props: any = {};
    if (this.attrs && this._fields) {
      for (let i = 0; i < this._fields.length; i++) {
        props[this._fields[i].name] = this.attrs[i];
      }
    }
    return {
      geometry: this.geom.toGeoJson(),
      properties: props,
      type: "Feature",
    };
  }
}

export class ShapeFeatureCollection {
  private _fields: Array<DbfFieldDescr>;
  private _features: Array<ShapeFeature> = new Array<ShapeFeature>();

  public get fields(): Array<DbfFieldDescr> {
    return this._fields;
  }

  public get features(): Array<ShapeFeature> {
    return this._features;
  }

  constructor(fields?: Array<DbfFieldDescr>) {
    if (!fields) {
      fields = new Array<DbfFieldDescr>();
    }
    this._fields = fields;
  }

  public toGeoJson(): GeoJsonFeatureCollection {
    let features = this._features.map((feature) => feature.toGeoJson());
    return {
      type: "FeatureCollection",
      features: features,
    };
  }
}

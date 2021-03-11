import { hint } from 'geojsonhint';

// This is a rip-off from geojson-assert, using the latest version of geojsonhint
// (partially re-implemented in TypeScript)

function GeoJSONError(info) {
  if (Array.isArray(info)) {
    info = info[0];
  }
  if (info.message) {
    this.message = 'GeoJSON Error: ' + info.message;
  }
  if (info.line) {
    this.message = this.message + ' at line ' + info.line;
  }
}
GeoJSONError.prototype = Object.create(Error.prototype);
GeoJSONError.prototype.name = 'GeoJSONError';
GeoJSONError.prototype.constructor = GeoJSONError;

export const geoJsonAssert = (json: any, obj?: object) => {
  let key;
  if (obj) {
    if (typeof json === 'string') {
      json = JSON.parse(json);
    }
    for (key in json) {
      geoJsonAssert(json[key]);
    }
    return;
  }
  if (typeof json !== 'string') {
    json = JSON.stringify(json);
  }
  const response = hint(json, undefined);
  if (!Array.isArray(response) || response.length) {
    throw new GeoJSONError(response);
  }
};

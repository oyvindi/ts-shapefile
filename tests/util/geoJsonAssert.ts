import { check } from '@placemarkio/check-geojson';

// Validates that the given GeoJSON object is well-formed.
// check() throws on invalid GeoJSON; on success it returns the parsed object.
export const geoJsonAssert = (json: unknown) => {
  const str = typeof json === 'string' ? json : JSON.stringify(json);
  check(str);
};

import { Coordinate } from './coordinate';

// Returns the ISO SQL/MM dimension suffix for a geometry with the given
// Z/M flags: '' for 2D, ' Z' for Z, ' M' for M, ' ZM' for both.
export const wktDimSuffix = (hasZ: boolean, hasM: boolean): string => {
  if (hasZ && hasM) return ' ZM';
  if (hasZ) return ' Z';
  if (hasM) return ' M';
  return '';
};

// Serializes a single coordinate to its WKT component list, e.g. "1 2" or
// "1 2 3" or "1 2 3 4". The number of components depends on hasZ/hasM.
export const coordToWkt = (coord: Coordinate): string => {
  if (coord.hasZ && coord.hasM) {
    return `${coord.x} ${coord.y} ${coord.z} ${coord.m}`;
  }
  if (coord.hasZ) {
    return `${coord.x} ${coord.y} ${coord.z}`;
  }
  if (coord.hasM) {
    return `${coord.x} ${coord.y} ${coord.m}`;
  }
  return `${coord.x} ${coord.y}`;
};

// Serializes a sequence of coordinates as a WKT parenthesized group, e.g.
// "(x1 y1, x2 y2, ...)".
export const coordsToWkt = (coords: Array<Coordinate>): string => {
  return `(${coords.map((c) => coordToWkt(c)).join(', ')})`;
};

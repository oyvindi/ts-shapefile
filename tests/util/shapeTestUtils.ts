import { assert } from 'chai';
import { ShapeReader } from '../../src/shp/shapeReader';
import { ShapeType } from '../../src/shp/geom/geometry';

import { openTestFile } from '../util/testUtils';
import { Coordinate } from '../../src/shp/geom/coordinate';

export const tolerance: number = 0.0000001;

export const assertValueOrNan = (value: number, expected: number, message?: string) => {
  if (isNaN(expected)) {
    assert.isNaN(value, message);
  } else {
    assert.closeTo(value, expected, tolerance, message);
  }
};

export const createAndVerifyReader = async (
  shpFileName: string,
  shxFileName: string,
  expectedType: ShapeType,
  expectedGeomCount: number
): Promise<ShapeReader> => {
  const shpFile = await openTestFile(shpFileName);
  const shxFile = await openTestFile(shxFileName);
  const reader = await ShapeReader.fromFile(shpFile, shxFile);
  assert.equal(reader.shapeType, expectedType);
  assert.strictEqual(reader.recordCount, expectedGeomCount, 'Unexpected number of records');
  return reader;
};

export interface xy {
  x: number;
  y: number;
}

export interface xym extends xy {
  m: number;
}

export interface xyzm extends xym {
  z: number;
}

export const assertCoordsXY = (coords: Array<Coordinate>, xy: Array<xy>) => {
  assert.equal(coords.length, xy.length, 'Unexpected number of vertices');
  for (let i = 0; i < coords.length; i++) {
    assert.closeTo(coords[i].x, xy[i].x, tolerance, `Point ${i}.x is wrong`);
    assert.closeTo(coords[i].y, xy[i].y, tolerance, `Point ${i}.y is wrong`);
  }
};

export const assertCoordsXYM = (coords: Array<Coordinate>, xym: Array<xym>) => {
  assertCoordsXY(coords, xym);
  for (let i = 0; i < coords.length; i++) {
    assertValueOrNan(coords[i].m, xym[i].m, `Point ${i}.m is wrong`);
  }
};

export const assertCoordsXYZM = (coords: Array<Coordinate>, xyzm: Array<xyzm>) => {
  assertCoordsXYM(coords, xyzm);
  for (let i = 0; i < coords.length; i++) {
    assert.closeTo(coords[i].z, xyzm[i].z, tolerance, `Point ${i}.z is wrong`);
  }
};

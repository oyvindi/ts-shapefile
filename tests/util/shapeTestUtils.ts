import { expect } from 'vitest';
import { ShapeReader } from '../../src/shp/shapeReader';
import { ShapeType } from '../../src/shp/geom/geometry';

import { openTestFile, openTestBuffer } from '../util/testUtils';
import { Coordinate } from '../../src/shp/geom/coordinate';

export const tolerance: number = 0.0000001;

export const assertValueOrNan = (value: number, expected: number, message?: string) => {
  if (isNaN(expected)) {
    expect(value, message).toBeNaN();
  } else {
    expect(value, message).toBeCloseTo(expected, 7);
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
  expect(reader.shapeType).toBe(expectedType);
  expect(reader.recordCount, 'Unexpected number of records').toBe(expectedGeomCount);
  return reader;
};

export const createAndVerifyReaderFromBuffer = async (
  shpFileName: string,
  shxFileName: string,
  expectedType: ShapeType,
  expectedGeomCount: number
): Promise<ShapeReader> => {
  const shp = await openTestBuffer(shpFileName);
  const shx = await openTestBuffer(shxFileName);
  const reader = await ShapeReader.fromArrayBuffer(shp, shx);
  expect(reader.shapeType).toBe(expectedType);
  expect(reader.recordCount, 'Unexpected number of records').toBe(expectedGeomCount);
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
  expect(coords.length, 'Unexpected number of vertices').toBe(xy.length);
  for (let i = 0; i < coords.length; i++) {
    expect(coords[i].x, `Point ${i}.x is wrong`).toBeCloseTo(xy[i].x, 7);
    expect(coords[i].y, `Point ${i}.y is wrong`).toBeCloseTo(xy[i].y, 7);
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
    expect(coords[i].z, `Point ${i}.z is wrong`).toBeCloseTo(xyzm[i].z, 7);
  }
};

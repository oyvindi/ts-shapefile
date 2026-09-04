import { describe, it, expect } from 'vitest';
import { ShapeType } from '../src/shp/geom/geometry';
import { createAndVerifyReader } from './util/shapeTestUtils';

// A parsed WKT node is either a coordinate (number[]) or a group of nodes.
type WktNode = number[] | WktNode[];

interface ParsedWkt {
  type: string;
  dim: string; // '', 'Z', 'M', 'ZM'
  empty: boolean;
  root: WktNode | null; // top-level parenthesized body, or null for EMPTY
}

// Parses a WKT string into a structured tree for assertion. Supports
// POINT, MULTIPOINT, LINESTRING, MULTILINESTRING, POLYGON, MULTIPOLYGON
// with optional Z/M/ZM dimension suffix and the EMPTY keyword.
const parseWkt = (wkt: string): ParsedWkt => {
  const match = wkt.match(/^([A-Z]+)\s*(ZM|Z|M)?\s*(EMPTY|\(.*\))$/);
  expect(match, `WKT did not match expected pattern: ${wkt}`).not.toBeNull();
  const type = match![1];
  const dim = match![2] ?? '';
  const body = match![3];

  if (body === 'EMPTY') {
    return { type, dim, empty: true, root: null };
  }

  // Recursive descent parser over the parenthesized body.
  let pos = 0;
  const s = body;

  const parseNode = (): WktNode => {
    expect(s[pos], `Expected '(' at pos ${pos} in "${s}"`).toBe('(');
    pos++; // consume '('
    const children: WktNode[] = [];
    while (pos < s.length) {
      const ch = s[pos];
      if (ch === ')') {
        pos++; // consume ')'
        return children;
      }
      if (ch === ',') {
        pos++; // consume ','
        continue;
      }
      if (ch === ' ') {
        pos++;
        continue;
      }
      if (ch === '(') {
        children.push(parseNode());
      } else {
        // Read a coordinate: numbers separated by spaces until ',' or ')'.
        let token = '';
        while (pos < s.length && s[pos] !== ',' && s[pos] !== ')') {
          token += s[pos];
          pos++;
        }
        children.push(token.trim().split(/\s+/).map(Number));
      }
    }
    return children;
  };

  return { type, dim, empty: false, root: parseNode() };
};

// Type-narrowing helpers for extracting structure from the parsed tree.
const asCoords = (node: WktNode): number[][] => node as number[][];
const asGroups = (node: WktNode): number[][][][] => node as number[][][][];

// Asserts that a coordinate tuple matches expected values within tolerance.
const assertCoord = (actual: number[], expected: number[], dim: number) => {
  expect(actual.length).toBe(dim);
  for (let i = 0; i < expected.length; i++) {
    if (isNaN(expected[i])) {
      expect(actual[i]).toBeNaN();
    } else {
      expect(actual[i]).toBeCloseTo(expected[i], 7);
    }
  }
};

describe('WKT serializing', () => {
  describe('WKT from Point', () => {
    it('POINT (2D)', async () => {
      const reader = await createAndVerifyReader('point.shp', 'point.shx', ShapeType.Point, 7);
      const wkt = reader.readGeom(0).toWkt()!;
      const parsed = parseWkt(wkt);
      expect(parsed.type).toBe('POINT');
      expect(parsed.dim).toBe('');
      const coords = asCoords(parsed.root!);
      expect(coords.length).toBe(1);
      assertCoord(coords[0], [-155, -154], 2);
    });

    it('POINT M', async () => {
      const reader = await createAndVerifyReader('pointM.shp', 'pointM.shx', ShapeType.PointM, 5);
      const wkt = reader.readGeom(0).toWkt()!;
      const parsed = parseWkt(wkt);
      expect(parsed.type).toBe('POINT');
      expect(parsed.dim).toBe('M');
      const coords = asCoords(parsed.root!);
      assertCoord(coords[0], [-178, -160, 1], 3);
    });

    it('POINT ZM', async () => {
      const reader = await createAndVerifyReader('pointZM.shp', 'pointZM.shx', ShapeType.PointZ, 6);
      const wkt = reader.readGeom(0).toWkt()!;
      const parsed = parseWkt(wkt);
      expect(parsed.type).toBe('POINT');
      expect(parsed.dim).toBe('ZM');
      const coords = asCoords(parsed.root!);
      assertCoord(coords[0], [-153, -178, 1, 2], 4);
    });
  });

  describe('WKT from MultiPoint', () => {
    it('MULTIPOINT (2D)', async () => {
      const reader = await createAndVerifyReader('multipoint.shp', 'multipoint.shx', ShapeType.MultiPoint, 3);
      const wkt = reader.readGeom(0).toWkt()!;
      const parsed = parseWkt(wkt);
      expect(parsed.type).toBe('MULTIPOINT');
      expect(parsed.dim).toBe('');
      // MULTIPOINT wraps each point in its own parens: ((x y), (x y), ...)
      const points = asGroups(parsed.root!);
      expect(points.length).toBe(5);
      assertCoord(points[0][0], [36.963112042621276, -129.36489649456098], 2);
    });

    it('MULTIPOINT M', async () => {
      const reader = await createAndVerifyReader('multipointM.shp', 'multipointM.shx', ShapeType.MultiPointM, 3);
      const wkt = reader.readGeom(0).toWkt()!;
      const parsed = parseWkt(wkt);
      expect(parsed.type).toBe('MULTIPOINT');
      expect(parsed.dim).toBe('M');
      const points = asGroups(parsed.root!);
      expect(points.length).toBe(5);
      assertCoord(points[0][0], [88.87773999411263, -137.89372822944887, 1], 3);
    });

    it('MULTIPOINT ZM', async () => {
      const reader = await createAndVerifyReader('multipointZM.shp', 'multipointZM.shx', ShapeType.MultiPointZ, 3);
      const wkt = reader.readGeom(0).toWkt()!;
      const parsed = parseWkt(wkt);
      expect(parsed.type).toBe('MULTIPOINT');
      expect(parsed.dim).toBe('ZM');
      const points = asGroups(parsed.root!);
      expect(points.length).toBe(6);
      assertCoord(points[0][0], [106.12081284942929, -160.14285449437375, 0, NaN], 4);
    });
  });

  describe('WKT from PolyLine', () => {
    it('LINESTRING (2D, single part)', async () => {
      const reader = await createAndVerifyReader('polyline.shp', 'polyline.shx', ShapeType.PolyLine, 3);
      const wkt = reader.readGeom(0).toWkt()!;
      const parsed = parseWkt(wkt);
      expect(parsed.type).toBe('LINESTRING');
      expect(parsed.dim).toBe('');
      const coords = asCoords(parsed.root!);
      expect(coords.length).toBe(3);
      assertCoord(coords[0], [-174.45654274957514, -156.65454128286527], 2);
    });

    it('MULTILINESTRING (2D, multi part)', async () => {
      const reader = await createAndVerifyReader('polyline.shp', 'polyline.shx', ShapeType.PolyLine, 3);
      const wkt = reader.readGeom(2).toWkt()!;
      const parsed = parseWkt(wkt);
      expect(parsed.type).toBe('MULTILINESTRING');
      expect(parsed.dim).toBe('');
      // MULTILINESTRING: ((...), (...)) — root is list of lines, each line is number[][]
      const lines = asGroups(parsed.root!);
      expect(lines.length).toBe(3); // 3 parts
      expect(lines[0].length).toBe(4); // first part has 4 coords
      assertCoord(lines[0][0], [-198.83625743041105, -175.07477015283018], 2);
    });

    it('LINESTRING M (single part)', async () => {
      const reader = await createAndVerifyReader('polylineM.shp', 'polylineM.shx', ShapeType.PolyLineM, 3);
      const wkt = reader.readGeom(0).toWkt()!;
      const parsed = parseWkt(wkt);
      expect(parsed.type).toBe('LINESTRING');
      expect(parsed.dim).toBe('M');
      const coords = asCoords(parsed.root!);
      expect(coords.length).toBe(3);
      assertCoord(coords[0], [39.19402681053475, -113.24564852679453, 10], 3);
    });

    it('MULTILINESTRING ZM (multi part)', async () => {
      const reader = await createAndVerifyReader('polylineZM.shp', 'polylineZM.shx', ShapeType.PolyLineZ, 3);
      const wkt = reader.readGeom(2).toWkt()!;
      const parsed = parseWkt(wkt);
      expect(parsed.type).toBe('MULTILINESTRING');
      expect(parsed.dim).toBe('ZM');
      const lines = asGroups(parsed.root!);
      expect(lines.length).toBe(3); // 3 parts
      assertCoord(lines[0][0], [-111.60670519384564, -126.90578866647462, 11, 1], 4);
    });
  });

  describe('WKT from Polygon', () => {
    it('POLYGON (2D, with holes)', async () => {
      const reader = await createAndVerifyReader('polygon.shp', 'polygon.shx', ShapeType.Polygon, 3);
      const wkt = reader.readGeom(0).toWkt()!;
      const parsed = parseWkt(wkt);
      expect(parsed.type).toBe('POLYGON');
      expect(parsed.dim).toBe('');
      // POLYGON: ((exterior), (interior1), (interior2)) — root is list of rings
      const rings = asGroups(parsed.root!);
      expect(rings.length).toBe(3); // 1 exterior + 2 interior rings
      expect(rings[0].length).toBe(5); // exterior ring has 5 coords (closed)
      assertCoord(rings[0][0], [100, 60], 2);
    });

    it('MULTIPOLYGON (2D, 3 polygons)', async () => {
      const reader = await createAndVerifyReader('polygon.shp', 'polygon.shx', ShapeType.Polygon, 3);
      const wkt = reader.readGeom(2).toWkt()!;
      const parsed = parseWkt(wkt);
      expect(parsed.type).toBe('MULTIPOLYGON');
      expect(parsed.dim).toBe('');
      // MULTIPOLYGON: (((ext), (int)), ((ext)), ((ext), (int)))
      const polygons = asGroups(parsed.root!) as number[][][][][];
      expect(polygons.length).toBe(3); // 3 polygons
      // First polygon: 1 exterior + 2 interiors
      expect(polygons[0].length).toBe(3);
      expect(polygons[0][0].length).toBe(6); // exterior ring
    });

    it('POLYGON M (no holes)', async () => {
      const reader = await createAndVerifyReader('polygonM.shp', 'polygonM.shx', ShapeType.PolygonM, 2);
      const wkt = reader.readGeom(0).toWkt()!;
      const parsed = parseWkt(wkt);
      expect(parsed.type).toBe('POLYGON');
      expect(parsed.dim).toBe('M');
      const rings = asGroups(parsed.root!);
      expect(rings.length).toBe(1); // exterior only
      expect(rings[0].length).toBe(4);
      assertCoord(rings[0][0], [-70, -115, 40], 3);
    });

    it('MULTIPOLYGON ZM (with holes)', async () => {
      const reader = await createAndVerifyReader('polygonZM.shp', 'polygonZM.shx', ShapeType.PolygonZ, 2);
      const wkt = reader.readGeom(1).toWkt()!;
      const parsed = parseWkt(wkt);
      expect(parsed.type).toBe('MULTIPOLYGON');
      expect(parsed.dim).toBe('ZM');
      const polygons = asGroups(parsed.root!) as number[][][][][];
      expect(polygons.length).toBe(3); // 3 polygons
      // First polygon: 1 exterior + 3 interiors
      expect(polygons[0].length).toBe(4);
      assertCoord(polygons[0][0][0], [84, -108, 0, 5], 4);
    });
  });

  describe('WKT from Null geometry', () => {
    it('returns null', async () => {
      const { ShpNullGeom } = await import('../src/shp/geom/null');
      const geom = new ShpNullGeom(ShapeType.Null);
      expect(geom.toWkt()).toBeNull();
    });
  });

  describe('WKT string format', () => {
    it('POINT produces correct string shape', async () => {
      const reader = await createAndVerifyReader('point.shp', 'point.shx', ShapeType.Point, 7);
      const wkt = reader.readGeom(0).toWkt()!;
      expect(wkt).toMatch(/^POINT \(-?\d+\.?\d* -?\d+\.?\d*\)$/);
    });

    it('POINT ZM produces correct string shape', async () => {
      const reader = await createAndVerifyReader('pointZM.shp', 'pointZM.shx', ShapeType.PointZ, 6);
      const wkt = reader.readGeom(0).toWkt()!;
      expect(wkt).toMatch(/^POINT ZM \(-?\d+\.?\d* -?\d+\.?\d* -?\d+\.?\d* -?\d+\.?\d*\)$/);
    });

    it('MULTIPOINT wraps each point in parens', async () => {
      const reader = await createAndVerifyReader('multipoint.shp', 'multipoint.shx', ShapeType.MultiPoint, 3);
      const wkt = reader.readGeom(0).toWkt()!;
      expect(wkt).toMatch(/^MULTIPOINT \(\(/);
      expect(wkt).toMatch(/\)\)$/);
    });

    it('POLYGON uses nested parens', async () => {
      const reader = await createAndVerifyReader('polygon.shp', 'polygon.shx', ShapeType.Polygon, 3);
      const wkt = reader.readGeom(0).toWkt()!;
      // POLYGON ((exterior), (interior), ...) — two opening parens
      expect(wkt).toMatch(/^POLYGON \(\(/);
      expect(wkt).toMatch(/\)\)$/);
    });

    it('MULTIPOLYGON uses triple-nested parens', async () => {
      const reader = await createAndVerifyReader('polygon.shp', 'polygon.shx', ShapeType.Polygon, 3);
      const wkt = reader.readGeom(2).toWkt()!;
      // MULTIPOLYGON (((ext), (int)), ...) — three opening parens
      expect(wkt).toMatch(/^MULTIPOLYGON \(\(\(/);
      expect(wkt).toMatch(/\)\)\)$/);
    });
  });
});

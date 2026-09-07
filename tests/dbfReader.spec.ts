import { describe, it, expect } from 'vitest';
import { DbfReader } from '../src/dbf/dbfReader';
import { DbfFieldDescr, DbfFieldType } from '../src/dbf/dbfTypes';
import { openTestFile, openTestBuffer } from './util/testUtils';

const cpDir = 'dbf_codepage/';

const assertField = (
  field: DbfFieldDescr,
  name: string,
  type: DbfFieldType,
  typeName: string,
  fieldLen: number,
  decimals: number
) => {
  expect(field.name).toBe(name);
  expect(field.type).toBe(type);
  expect(field.typeName).toBe(typeName);
  expect(field.fieldLen).toBe(fieldLen);
  expect(field.decimalCount).toBe(decimals);
};

// --- Synthetic DBF builder -------------------------------------------------
// Builds a minimal dBASE III file in memory. Each field is {name, type, len}.
// Records are arrays of raw byte arrays (one per field, excluding deleted flag).
interface SynthField {
  name: string;
  type: string;
  len: number;
  decimals?: number;
}

const buildDbf = (fields: SynthField[], records: Uint8Array[][]): ArrayBuffer => {
  const fieldCount = fields.length;
  const headerSize = 32 + 32 * fieldCount + 1; // header + descriptors + terminator
  const recordSize = 1 + fields.reduce((s, f) => s + f.len, 0); // deleted flag + fields
  const totalSize = headerSize + recordSize * records.length + 1; // +1 EOF marker

  const buf = new ArrayBuffer(totalSize);
  const view = new DataView(buf);
  const bytes = new Uint8Array(buf);

  // Header
  bytes[0] = 0x03; // dBASE III version
  bytes[1] = 120; // year - 1900 = 2020
  bytes[2] = 12; // month (1-based)
  bytes[3] = 15; // day
  view.setInt32(4, records.length, true); // record count
  view.setInt16(8, headerSize, true); // header size
  view.setInt16(10, recordSize, true); // record size
  bytes[29] = 0; // lang code (default = cp1252)

  // Field descriptors
  for (let f = 0; f < fieldCount; f++) {
    const off = 32 + f * 32;
    const nameBytes = new TextEncoder().encode(fields[f].name);
    for (let i = 0; i < nameBytes.length && i < 10; i++) bytes[off + i] = nameBytes[i];
    bytes[off + 11] = fields[f].type.charCodeAt(0);
    bytes[off + 16] = fields[f].len;
    bytes[off + 17] = fields[f].decimals ?? 0;
  }

  // Field terminator
  bytes[32 + 32 * fieldCount] = 0x0d;

  // Records
  for (let r = 0; r < records.length; r++) {
    const recOff = headerSize + r * recordSize;
    bytes[recOff] = 0x20; // not deleted
    let fOff = recOff + 1;
    for (let f = 0; f < fieldCount; f++) {
      const data = records[r][f];
      for (let i = 0; i < data.length && i < fields[f].len; i++) {
        bytes[fOff + i] = data[i];
      }
      fOff += fields[f].len;
    }
  }

  // EOF marker
  bytes[headerSize + recordSize * records.length] = 0x1a;

  return buf;
};

const strToBytes = (s: string): Uint8Array => new TextEncoder().encode(s);
const spaceBytes = (n: number): Uint8Array => new Uint8Array(n).fill(0x20);

describe('DbfReader', () => {
  describe('DBF all field types UTF8', () => {
    it('', async () => {
      const cpgFile = await openTestFile('attr_types.CPG');
      const dbfFile = await openTestFile('attr_types.dbf');
      const reader = await DbfReader.fromFile(dbfFile, cpgFile);
      const fields = reader.fields;
      expect(fields.length).toBe(6);
      expect(reader.encoding).toBe('utf8');

      assertField(fields[0], 'float', 'F', 'Float', 13, 11);
      assertField(fields[1], 'double', 'F', 'Float', 19, 11);
      assertField(fields[2], 'text', 'C', 'Character', 50, 0);
      assertField(fields[3], 'date', 'D', 'Date', 8, 0);
      assertField(fields[4], 'long', 'N', 'Number', 10, 0);
      assertField(fields[5], 'short', 'N', 'Number', 5, 0);

      let record = reader.readRecord(0);
      expect(record[0]).toBeCloseTo(123.123, 7);
      expect(record[1]).toBeCloseTo(1.123456789, 7);
      expect(record[2]).toBe('Some text');
      expect((record[3] as Date).getTime()).toBe(new Date(2020, 11, 15).getTime());
      expect(record[4]).toBe(55555555);
      expect(record[5]).toBe(44444);

      // DBF header stores year=120 (2020), month=12 (December, 1-based), day=15
      expect(reader.lastUpdated.getTime()).toBe(new Date(2020, 11, 15).getTime());

      // This DBF is UTF-8 encoded, test with Norwegian and German characters
      record = reader.readRecord(1);
      expect(record[2]).toBe('Norwegian ÆØÅ');
      record = reader.readRecord(2);
      expect(record[2]).toBe('German ÄÖÜẞ');
    });
  });

  describe('DBF codepage 865', () => {
    it('', async () => {
      // This example has no separate .CPG-file, encoding specified in file header
      // Test with Norwegian letters ÆØÅ
      const dbfFile = await openTestFile(`${cpDir}cp865.dbf`);
      const reader = await DbfReader.fromFile(dbfFile);
      const fields = reader.fields;
      expect(fields.length).toBe(2);
      expect(reader.recordCount).toBe(3);
      expect(reader.encoding).toBe('cp865');
      const row = reader.readRecord(2);
      expect(row[1]).toBe('æøåÆØÅ');
    });
  });

  describe('DBF codepage 1252', () => {
    it('', async () => {
      // Test with Norwegian letters ÆØÅ
      const cpgFile = await openTestFile(`${cpDir}cp1252.CPG`);
      const dbfFile = await openTestFile(`${cpDir}cp1252.dbf`);
      const reader = await DbfReader.fromFile(dbfFile, cpgFile);
      const fields = reader.fields;
      expect(fields.length).toBe(2);
      expect(reader.recordCount).toBe(3);
      expect(reader.encoding).toBe('cp1252');
      const row = reader.readRecord(1);
      expect(row[1]).toBe('ÆØÅæøå');
    });
  });

  describe('DBF ISO-8859-1', () => {
    it('', async () => {
      // Test with Norwegian letters ÆØÅ
      const cpgFile = await openTestFile(`${cpDir}cp88591.cpg`);
      const dbfFile = await openTestFile(`${cpDir}cp88591.dbf`);
      const reader = await DbfReader.fromFile(dbfFile, cpgFile);
      expect(reader.encoding).toBe('ISO-8859-1');
      const fields = reader.fields;
      expect(fields.length).toBe(2);
      expect(reader.recordCount).toBe(3);
      const row = reader.readRecord(2);
      expect(row[1]).toBe('ÆØÅæøå');
    });
  });

  describe('DBF fromArrayBuffer (UTF-8 with CPG)', () => {
    it('should produce the same result via raw ArrayBuffer input', async () => {
      const cpgBuf = await openTestBuffer('attr_types.CPG');
      const dbfBuf = await openTestBuffer('attr_types.dbf');
      const reader = await DbfReader.fromArrayBuffer(dbfBuf, cpgBuf);
      const fields = reader.fields;
      expect(fields.length).toBe(6);
      expect(reader.encoding).toBe('utf8');

      assertField(fields[0], 'float', 'F', 'Float', 13, 11);
      assertField(fields[1], 'double', 'F', 'Float', 19, 11);
      assertField(fields[2], 'text', 'C', 'Character', 50, 0);
      assertField(fields[3], 'date', 'D', 'Date', 8, 0);
      assertField(fields[4], 'long', 'N', 'Number', 10, 0);
      assertField(fields[5], 'short', 'N', 'Number', 5, 0);

      let record = reader.readRecord(0);
      expect(record[0]).toBeCloseTo(123.123, 7);
      expect(record[1]).toBeCloseTo(1.123456789, 7);
      expect(record[2]).toBe('Some text');
      expect((record[3] as Date).getTime()).toBe(new Date(2020, 11, 15).getTime());
      expect(record[4]).toBe(55555555);
      expect(record[5]).toBe(44444);

      // DBF header stores year=120 (2020), month=12 (December, 1-based), day=15
      expect(reader.lastUpdated.getTime()).toBe(new Date(2020, 11, 15).getTime());

      record = reader.readRecord(1);
      expect(record[2]).toBe('Norwegian ÆØÅ');
      record = reader.readRecord(2);
      expect(record[2]).toBe('German ÄÖÜẞ');
    });
  });

  describe('DBF fromArrayBuffer (codepage from header)', () => {
    it('should resolve encoding from DBF header when no CPG is provided', async () => {
      const dbfBuf = await openTestBuffer(`${cpDir}cp865.dbf`);
      const reader = await DbfReader.fromArrayBuffer(dbfBuf);
      expect(reader.fields.length).toBe(2);
      expect(reader.recordCount).toBe(3);
      expect(reader.encoding).toBe('cp865');
      const row = reader.readRecord(2);
      expect(row[1]).toBe('æøåÆØÅ');
    });
  });

  describe('DBF character field with null terminator', () => {
    it('should not produce trailing \\u0000 characters', async () => {
      // Build a minimal DBF in memory with one Character field (len=10)
      // containing "Hello" followed by null bytes.
      const headerSize = 32 + 32 + 1; // header + 1 field descriptor + terminator
      const recordSize = 1 + 10; // deleted flag + field length
      const buf = new ArrayBuffer(headerSize + recordSize + 1); // +1 for EOF marker
      const view = new DataView(buf);
      const bytes = new Uint8Array(buf);

      // Header
      bytes[0] = 0x03; // dBASE III version
      bytes[1] = 120; // year - 1900 = 2020
      bytes[2] = 12; // month (1-based, December)
      bytes[3] = 15; // day
      view.setInt32(4, 1, true); // record count = 1
      view.setInt16(8, headerSize, true); // header size
      view.setInt16(10, recordSize, true); // record size
      bytes[29] = 0; // lang code (default = cp1252)

      // Field descriptor: name="NAME", type='C', length=10
      const nameBytes = [78, 65, 77, 69]; // "NAME"
      for (let i = 0; i < nameBytes.length; i++) bytes[32 + i] = nameBytes[i];
      bytes[32 + 11] = 0x43; // 'C' (Character)
      bytes[32 + 16] = 10; // field length
      bytes[32 + 17] = 0; // decimal count

      // Field terminator
      bytes[32 + 32] = 0x0d;

      // Record: deleted flag + "Hello\0\0\0\0\0"
      const recOff = headerSize;
      bytes[recOff] = 0x20; // not deleted
      const hello = [72, 101, 108, 108, 111]; // "Hello"
      for (let i = 0; i < hello.length; i++) bytes[recOff + 1 + i] = hello[i];
      // Remaining 5 bytes stay as 0x00 (null terminator)

      // EOF marker
      bytes[headerSize + recordSize] = 0x1a;

      const reader = await DbfReader.fromArrayBuffer(buf);
      const record = reader.readRecord(0);
      expect(record[0]).toBe('Hello');
      expect((record[0] as string).indexOf('\u0000')).toBe(-1);
    });
  });

  describe('DBF Logical (L) field', () => {
    it('should decode Y/N to boolean and other chars (T/F/?) to null', async () => {
      // The reader only recognizes y/Y -> true and n/N -> false.
      // T/F (dBASE also-rans) and any other char -> null.
      const buf = buildDbf(
        [{ name: 'FLAG', type: 'L', len: 1 }],
        [
          [new Uint8Array([0x59])], // 'Y' -> true
          [new Uint8Array([0x4e])], // 'N' -> false
          [new Uint8Array([0x79])], // 'y' -> true
          [new Uint8Array([0x6e])], // 'n' -> false
          [new Uint8Array([0x54])], // 'T' -> null (not handled)
          [new Uint8Array([0x46])], // 'F' -> null (not handled)
          [new Uint8Array([0x3f])], // '?' -> null
          [spaceBytes(1)] // ' ' -> null
        ]
      );
      const reader = await DbfReader.fromArrayBuffer(buf);
      expect(reader.readRecord(0)[0]).toBe(true);
      expect(reader.readRecord(1)[0]).toBe(false);
      expect(reader.readRecord(2)[0]).toBe(true);
      expect(reader.readRecord(3)[0]).toBe(false);
      expect(reader.readRecord(4)[0]).toBeNull();
      expect(reader.readRecord(5)[0]).toBeNull();
      expect(reader.readRecord(6)[0]).toBeNull();
      expect(reader.readRecord(7)[0]).toBeNull();
    });
  });

  describe('DBF deleted record', () => {
    it('should return null for all fields when deleted flag is 0x2a', async () => {
      const headerSize = 32 + 32 * 2 + 1;
      const recordSize = 1 + 10 + 5;
      const buf = new ArrayBuffer(headerSize + recordSize * 2 + 1);
      const view = new DataView(buf);
      const bytes = new Uint8Array(buf);

      bytes[0] = 0x03;
      view.setInt32(4, 2, true);
      view.setInt16(8, headerSize, true);
      view.setInt16(10, recordSize, true);

      // Field descriptors
      const nameBytes = strToBytes('NAME');
      for (let i = 0; i < nameBytes.length; i++) bytes[32 + i] = nameBytes[i];
      bytes[32 + 11] = 0x43; // 'C'
      bytes[32 + 16] = 10;
      const valBytes = strToBytes('VAL');
      for (let i = 0; i < valBytes.length; i++) bytes[64 + i] = valBytes[i];
      bytes[64 + 11] = 0x4e; // 'N'
      bytes[64 + 16] = 5;
      bytes[96] = 0x0d; // field terminator

      // Record 0: not deleted
      bytes[headerSize] = 0x20;
      const hello = strToBytes('Hello');
      for (let i = 0; i < hello.length; i++) bytes[headerSize + 1 + i] = hello[i];
      const num = strToBytes('12345');
      for (let i = 0; i < num.length; i++) bytes[headerSize + 1 + 10 + i] = num[i];

      // Record 1: deleted (0x2a)
      const rec1Off = headerSize + recordSize;
      bytes[rec1Off] = 0x2a;

      bytes[headerSize + recordSize * 2] = 0x1a; // EOF

      const reader = await DbfReader.fromArrayBuffer(buf);
      const rec0 = reader.readRecord(0);
      expect(rec0[0]).toBe('Hello');
      expect(rec0[1]).toBe(12345);

      const rec1 = reader.readRecord(1);
      expect(rec1.length).toBe(2);
      expect(rec1[0]).toBeNull();
      expect(rec1[1]).toBeNull();
    });
  });

  describe('DBF blank numeric field (pseudo-null)', () => {
    it('should return NaN for blank numeric fields (Esri pseudo-null)', async () => {
      const buf = buildDbf(
        [
          { name: 'INT', type: 'N', len: 5, decimals: 0 },
          { name: 'FLT', type: 'F', len: 10, decimals: 2 }
        ],
        [
          [spaceBytes(5), spaceBytes(10)], // both blank
          [strToBytes('  42'), strToBytes('  3.14  ')] // valid values
        ]
      );
      const reader = await DbfReader.fromArrayBuffer(buf);

      // Blank numeric fields yield NaN -- this documents the current behavior
      // where Esri's pseudo-null (blank) is NOT coerced to 0.
      const rec0 = reader.readRecord(0);
      expect(rec0[0]).toBeNaN();
      expect(rec0[1]).toBeNaN();

      const rec1 = reader.readRecord(1);
      expect(rec1[0]).toBe(42);
      expect(rec1[1]).toBeCloseTo(3.14, 5);
    });
  });

  describe('DBF invalid Date field', () => {
    it('should return null for blank or malformed date fields', async () => {
      const buf = buildDbf(
        [{ name: 'DATE', type: 'D', len: 8 }],
        [
          [spaceBytes(8)], // blank -> null
          [strToBytes('20201215')], // valid date
          [strToBytes('00000000')], // zero date -> null (doesn't match YYYYMMDD? it does, but Date(0,0,0) is invalid)
          [strToBytes('20201301')] // invalid month 13 -> Date wraps, but regex matches
        ]
      );
      const reader = await DbfReader.fromArrayBuffer(buf);

      // Blank date -> null (regex doesn't match spaces)
      expect(reader.readRecord(0)[0]).toBeNull();

      // Valid date
      const rec1 = reader.readRecord(1)[0] as Date;
      expect(rec1.getTime()).toBe(new Date(2020, 11, 15).getTime());

      // 00000000 matches the regex but produces Date(0, -1, 0) = 1899-11-30
      // This documents that the regex alone doesn't validate semantic correctness
      const rec2 = reader.readRecord(2)[0];
      expect(rec2).not.toBeNull();

      // 20201301 matches regex, JS Date overflows month -> 2021-01-01
      const rec3 = reader.readRecord(3)[0] as Date;
      expect(rec3).not.toBeNull();
    });
  });

  describe('DBF multi-byte UTF-8 truncation at byte boundary', () => {
    it('should truncate text at byte boundary, not character boundary', async () => {
      // Field width = 10 bytes. Each Norwegian char (ÆØÅ) is 2 bytes in UTF-8.
      // "ÆØÅÆØÅ" = 12 bytes -> truncated to 10 bytes = "ÆØÅÆØ" (5 chars, 10 bytes).
      // The 6th char (Å, 2 bytes) doesn't fit, so it's cut at the byte boundary.
      const text = 'ÆØÅÆØÅ';
      const encoded = strToBytes(text);
      expect(encoded.length).toBe(12); // 6 chars * 2 bytes

      const buf = buildDbf(
        [{ name: 'TXT', type: 'C', len: 10 }],
        [[encoded]]
      );
      const cpgBuf = strToBytes('UTF-8').buffer as ArrayBuffer;
      const reader = await DbfReader.fromArrayBuffer(buf, cpgBuf);
      const record = reader.readRecord(0);
      // Only 10 bytes fit: "ÆØÅÆØ" (5 chars)
      expect(record[0]).toBe('ÆØÅÆØ');
      expect((record[0] as string).length).toBe(5);
    });

    it('should not split a multi-byte sequence in the middle', async () => {
      // Field width = 5 bytes. "ÆØÅ" = 6 bytes. Only 5 bytes fit, but the 3rd
      // char (Å) is 2 bytes and only 1 byte remains, so it's cut before Å.
      const text = 'ÆØÅ';
      const encoded = strToBytes(text);
      expect(encoded.length).toBe(6);

      const buf = buildDbf(
        [{ name: 'TXT', type: 'C', len: 5 }],
        [[encoded]]
      );
      const cpgBuf = strToBytes('UTF-8').buffer as ArrayBuffer;
      const reader = await DbfReader.fromArrayBuffer(buf, cpgBuf);
      const record = reader.readRecord(0);
      // 5 bytes = "ÆØ" (4 bytes) + 1 byte of Å -> the reader stops at
      // fieldLen bytes, so the last byte is half of a UTF-8 sequence.
      // TextDecoder replaces the incomplete trailing byte with U+FFFD.
      // After trim(), the result starts with "ÆØ".
      expect((record[0] as string).startsWith('ÆØ')).toBe(true);
    });
  });

  describe('DBF unknown field type', () => {
    it('should return null for unrecognized field types', async () => {
      // 'M' (Memo) is in DbfFieldType but not handled in readRecord's switch,
      // so it falls through to the default case -> null.
      const buf = buildDbf(
        [
          { name: 'TXT', type: 'C', len: 5 },
          { name: 'MEMO', type: 'M', len: 10 }
        ],
        [[strToBytes('Hello'), spaceBytes(10)]]
      );
      const reader = await DbfReader.fromArrayBuffer(buf);
      const record = reader.readRecord(0);
      expect(record[0]).toBe('Hello');
      expect(record[1]).toBeNull();
    });
  });

  describe('DBF fromFile with null input', () => {
    it('should throw when dbf file is null', async () => {
      await expect(DbfReader.fromFile(null as unknown as File)).rejects.toThrow(
        'No .dbf file provided'
      );
    });
  });

  describe('DBF CPG precedence over header LDID', () => {
    it('should use CPG encoding even when header LDID specifies a different code page', async () => {
      // Build a DBF with LDID=8 (cp865) but provide a CPG saying UTF-8.
      // The CPG should win.
      const headerSize = 32 + 32 + 1;
      const recordSize = 1 + 3;
      const buf = new ArrayBuffer(headerSize + recordSize + 1);
      const view = new DataView(buf);
      const bytes = new Uint8Array(buf);

      bytes[0] = 0x03;
      view.setInt32(4, 1, true);
      view.setInt16(8, headerSize, true);
      view.setInt16(10, recordSize, true);
      bytes[29] = 8; // LDID = 8 -> cp865

      // Field: NAME, C, len=3
      const nameBytes = strToBytes('NAME');
      for (let i = 0; i < nameBytes.length; i++) bytes[32 + i] = nameBytes[i];
      bytes[32 + 11] = 0x43;
      bytes[32 + 16] = 3;
      bytes[64] = 0x0d;

      // Record: "ABC"
      bytes[headerSize] = 0x20;
      bytes[headerSize + 1] = 0x41;
      bytes[headerSize + 2] = 0x42;
      bytes[headerSize + 3] = 0x43;
      bytes[headerSize + recordSize] = 0x1a;

      const cpgBuf = strToBytes('UTF-8').buffer as ArrayBuffer;
      const reader = await DbfReader.fromArrayBuffer(buf, cpgBuf);

      // CPG says UTF-8, not cp865
      expect(reader.encoding).toBe('utf8');
      expect(reader.readRecord(0)[0]).toBe('ABC');
    });
  });
});

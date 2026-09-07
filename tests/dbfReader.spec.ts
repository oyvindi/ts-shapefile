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
      expect(record[3].getTime()).toBe(new Date(2020, 11, 15).getTime());
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
      expect(record[3].getTime()).toBe(new Date(2020, 11, 15).getTime());
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
});

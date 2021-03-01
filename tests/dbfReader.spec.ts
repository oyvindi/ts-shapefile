import { describe, it } from 'mocha';
import { assert } from 'chai';
import { DbfReader } from '../src/dbf/dbfReader';
import { DbfFieldDescr, DbfFieldType } from '../src/dbf/dbfTypes';
import { tolerance } from './util/shapeTestUtils';
import { openTestFile } from './util/testUtils';

const cpDir = 'dbf_codepage/';

const assertField = (
  field: DbfFieldDescr,
  name: string,
  type: DbfFieldType,
  typeName: string,
  fieldLen: number,
  decimals: number
) => {
  assert.equal(field.name, name);
  assert.equal(field.type, type);
  assert.equal(field.typeName, typeName);
  assert.equal(field.fieldLen, fieldLen);
  assert.equal(field.decimalCount, decimals);
};

describe('DbfReader', () => {
  describe('DBF all field types UTF8', () => {
    it('', async () => {
      const cpgFile = await openTestFile('attr_types.CPG');
      const dbfFile = await openTestFile('attr_types.dbf');
      const reader = await DbfReader.fromFile(dbfFile, cpgFile);
      const fields = reader.fields;
      assert.equal(fields.length, 6);
      assert.equal(reader.encoding, 'utf8');

      assertField(fields[0], 'float', 'F', 'Float', 13, 11);
      assertField(fields[1], 'double', 'F', 'Float', 19, 11);
      assertField(fields[2], 'text', 'C', 'Character', 50, 0);
      assertField(fields[3], 'date', 'D', 'Date', 8, 0);
      assertField(fields[4], 'long', 'N', 'Number', 10, 0);
      assertField(fields[5], 'short', 'N', 'Number', 5, 0);

      let record = reader.readRecord(0);
      assert.closeTo(record[0], 123.123, tolerance);
      assert.closeTo(record[1], 1.123456789, tolerance);
      assert.equal(record[2], 'Some text');
      assert.equal(record[3].getTime(), new Date(2021, 0, 15).getTime());
      assert.equal(record[4], 55555555);
      assert.equal(record[5], 44444);

      // This DBF is UTF-8 encoded, test with Norwegian and German characters
      record = reader.readRecord(1);
      assert.equal(record[2], 'Norwegian ÆØÅ');
      record = reader.readRecord(2);
      assert.equal(record[2], 'German ÄÖÜẞ');
    });
  });

  describe('DBF codepage 865', () => {
    it('', async () => {
      // This example has no separate .CPG-file, encoding specified in file header
      // Test with Norwegian letters ÆØÅ
      const dbfFile = await openTestFile(`${cpDir}cp865.dbf`);
      const reader = await DbfReader.fromFile(dbfFile);
      const fields = reader.fields;
      assert.equal(fields.length, 2);
      assert.equal(3, reader.recordCount);
      assert.equal(reader.encoding, 'cp865');
      const row = reader.readRecord(2);
      assert.equal(row[1], 'æøåÆØÅ');
    });
  });

  describe('DBF codepage 1252', () => {
    it('', async () => {
      // Test with Norwegian letters ÆØÅ
      const cpgFile = await openTestFile(`${cpDir}cp1252.CPG`);
      const dbfFile = await openTestFile(`${cpDir}cp1252.dbf`);
      const reader = await DbfReader.fromFile(dbfFile, cpgFile);
      const fields = reader.fields;
      assert.equal(fields.length, 2);
      assert.equal(3, reader.recordCount);
      assert.equal(reader.encoding, 'cp1252');
      const row = reader.readRecord(1);
      assert.equal(row[1], 'ÆØÅæøå');
    });
  });

  describe('DBF ISO-8859-1', () => {
    it('', async () => {
      // Test with Norwegian letters ÆØÅ
      const cpgFile = await openTestFile(`${cpDir}cp88591.cpg`);
      const dbfFile = await openTestFile(`${cpDir}cp88591.dbf`);
      const reader = await DbfReader.fromFile(dbfFile, cpgFile);
      assert.equal(reader.encoding, 'ISO-8859-1');
      const fields = reader.fields;
      assert.equal(fields.length, 2);
      assert.equal(3, reader.recordCount);
      const row = reader.readRecord(2);
      assert.equal(row[1], 'ÆØÅæøå');
    });
  });
});

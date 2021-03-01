import { MemoryStream } from '../util/memoryStream';
import { DbfFieldDescr, DbfFieldType, DbfHeader } from './dbfTypes';
import { DbfDecoder, DbfDecoderFactory } from './dbfDecoderFactory';
import 'buffer';

const FieldTypeNames: any = {
  C: 'Character',
  N: 'Number',
  L: 'Logical',
  F: 'Float',
  D: 'Date'
};

export class DbfReader {
  private static _regExDate = /^(\d\d\d\d)(\d\d)(\d\d)$/;
  private _stream: MemoryStream;
  private _header: DbfHeader;
  private _fields: Array<DbfFieldDescr> = [];
  private _recordStartOffset: number = 0;
  private _recordSize: number = 0;
  private _decoder?: DbfDecoder;

  public get fields(): Array<DbfFieldDescr> {
    return this._fields;
  }

  public get recordCount(): number {
    return this._header.recordCount;
  }

  public get encoding(): string {
    return this._decoder?.encoding ?? '';
  }

  private constructor(dbf: ArrayBuffer, decoder?: DbfDecoder) {
    this._stream = new MemoryStream(dbf);
    this._decoder = decoder; /* If not provided, it will be created from header info below */
    this._header = this._readHeader();
  }

  public static async fromFile(file: File, cpgFile?: File): Promise<DbfReader> {
    if (file == null) {
      throw new Error('No .dbf file provided');
    }
    try {
      const buffer = await file.arrayBuffer();
      let cpgBuf: ArrayBuffer | undefined;
      if (cpgFile) {
        cpgBuf = await cpgFile.arrayBuffer();
      }
      return this.fromArrayBuffer(buffer, cpgBuf);
    } catch (err) {
      throw new Error(`Failed to open .dbf file: ${err.message}`);
    }
  }

  public static async fromArrayBuffer(buffer: ArrayBuffer, cpgBuf?: ArrayBuffer): Promise<DbfReader> {
    try {
      let decoder: DbfDecoder | undefined;
      if (cpgBuf) {
        const cpgDecoder = new TextDecoder();
        const cpgStr = await cpgDecoder.decode(cpgBuf);
        decoder = DbfDecoderFactory.fromCpgString(cpgStr);
      }
      return new DbfReader(buffer, decoder);
    } catch (err) {
      throw new Error(`Unexpected error when opening .dbf: ${err.message}`);
    }
  }

  private _readHeader(): DbfHeader {
    const s = this._stream;
    s.seek(0);
    const version = s.readByte();
    const updatedY = s.readByte();
    const updatedM = s.readByte();
    const updatedD = s.readByte();
    const recordCount = s.readInt32(true);
    s.readInt16(true); // skip headerSize
    s.readInt16(true); // skip recordSize ( can't be trusted, may be 0 for some reason)
    const lang = s.seek(29).readByte();
    /* Create a decoder if not provided in constructor */
    if (!this._decoder) {
      this._decoder = DbfDecoderFactory.fromDbfLangCode(lang);
    }

    // Skip to field defs
    let recordIdx = 32;
    while (true) {
      s.seek(recordIdx);
      const firstByte = s.peekByte();
      if (firstByte === 0x0d) {
        break;
      }
      let fieldName = '';
      for (let i = 0; i < 10; i++) {
        const charCode = s.readByte();
        if (charCode === 0) {
          break;
        }
        fieldName += String.fromCharCode(charCode);
      }
      fieldName = fieldName.trim();
      s.seek(recordIdx + 11);
      const fieldTypeCode = s.readByte();
      const fieldType: DbfFieldType = String.fromCharCode(fieldTypeCode) as DbfFieldType;
      s.seek(recordIdx + 16);
      const fieldLen = s.readByte();
      const decimals = s.readByte();

      const field: DbfFieldDescr = {
        name: fieldName,
        type: fieldType,
        typeName: FieldTypeNames[fieldType] || 'Unknown',
        fieldLen: fieldLen,
        decimalCount: decimals
      };
      this._fields.push(field);
      recordIdx += 32;
    }
    // Calc record size
    this._recordSize = 1; // Count "deleted" byte as well
    this.fields.forEach((field) => (this._recordSize += field.fieldLen));
    s.readByte();
    this._recordStartOffset = s.tell;
    return {
      lastUpdated: new Date(updatedY + 1900, updatedM, updatedD),
      recordCount: recordCount,
      version: version
    };
  }

  public readRecord(index: number): any[] {
    let offset = this._recordStartOffset + index * this._recordSize;
    this._stream.seek(offset);
    const deletedFlag = this._stream.readByte();
    const result: Array<any> = [];
    if (deletedFlag === 0x2a) {
      // Deleted record, fill with null
      this._fields.forEach(() => result.push(null));
      return result;
    }
    offset += 1; // deleted flag
    this._fields.forEach((field) => {
      this._stream.seek(offset);
      switch (field.type) {
        case 'C':
          result.push(this._readCharValue(field));
          break;
        case 'N':
          result.push(this._readNumberValue(field));
          break;
        case 'F':
          result.push(this._readNumberValue(field));
          break;
        case 'D':
          result.push(this._readDateValue(field));
          break;
        case 'L':
          result.push(this._readLogicalValue(field));
          break;
        default:
          result.push(null);
      }
      offset += field.fieldLen;
    });
    return result;
  }

  private _readCharValue(field: DbfFieldDescr): string {
    const chars: Uint8Array = new Uint8Array(field.fieldLen);
    for (let i = 0; i < field.fieldLen; i++) {
      const charCode = this._stream.readByte();
      if (charCode === 0) {
        break;
      }
      chars[i] = charCode;
    }
    const value = this._decoder!.decode(chars);
    return value.trim();
  }

  private _readNumberValue(field: DbfFieldDescr): number {
    const val = this._readCharValue(field);
    if (field.decimalCount === 0) {
      return parseInt(val);
    }
    return parseFloat(val);
  }

  private _readDateValue(field: DbfFieldDescr): Date | null {
    const strVal = this._readCharValue(field);
    const m = strVal.match(DbfReader._regExDate);
    if (m == null) {
      return null;
    }
    return new Date(+m[1], +m[2], +m[3]);
  }

  private _readLogicalValue(field: DbfFieldDescr): boolean | null {
    const charCode = this._stream.readByte();
    switch (String.fromCharCode(charCode)) {
      case 'y':
      case 'Y':
        return true;
      case 'n':
      case 'N':
        return false;
    }
    return null;
  }
}

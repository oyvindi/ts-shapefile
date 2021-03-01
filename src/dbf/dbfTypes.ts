export type DbfFieldType = 'B' | 'C' | 'D' | 'N' | 'L' | 'M' | '@' | 'I' | 'F' | '0' | 'G';

export interface DbfHeader {
  readonly version: number;
  readonly lastUpdated: Date;
  readonly recordCount: number;
}

export interface DbfFieldDescr {
  readonly name: string;
  readonly type: DbfFieldType;
  readonly typeName: string /* Human readable type name */;
  readonly fieldLen: number;
  readonly decimalCount: number;
}

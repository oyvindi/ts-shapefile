import { DbfFieldDescr } from "./dbfTypes";
export declare class DbfReader {
    private static _regExDate;
    private _stream;
    private _header;
    private _fields;
    private _recordStartOffset;
    private _recordSize;
    private _decoder;
    get fields(): Array<DbfFieldDescr>;
    get recordCount(): number;
    get encoding(): string;
    private constructor();
    static fromFile(file: File, cpgFile?: File): Promise<DbfReader>;
    static fromArrayBuffer(buffer: ArrayBuffer, cpgBuf?: ArrayBuffer): Promise<DbfReader>;
    private _readHeader;
    readRecord(index: number): any[];
    private _readCharValue;
    private _readNumberValue;
    private _readDateValue;
    private _readLogicalValue;
}

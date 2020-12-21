export declare class MemoryStream {
    private _dataView;
    private _offset;
    private _size;
    get tell(): number;
    constructor(buffer: ArrayBuffer);
    seek(offset: number): MemoryStream;
    readInt16(littleEndian?: boolean): number;
    readInt32(littleEndian?: boolean): number;
    readInt32Array(count: number, littleEndian?: boolean): Int32Array;
    readDouble(littleEndian?: boolean): number;
    readDoubleArray(count: number, littleEndian?: boolean): Float64Array;
    peekByte(): number;
    readByte(): number;
}

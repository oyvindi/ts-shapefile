export class MemoryStream {
  private _dataView: DataView;
  private _offset: number = 0;
  private _size: number = 0;

  public get tell(): number {
    return this._offset;
  }

  constructor(buffer: ArrayBuffer) {
    this._size = buffer.byteLength;
    this._dataView = new DataView(buffer);
  }

  public seek(offset: number): MemoryStream {
    if (offset < 0 || offset > this._size) {
      throw new Error(`Seek offset ${offset} out of bounds (size ${this._size})`);
    }
    this._offset = offset;
    return this;
  }

  private _ensureBytes(byteCount: number): void {
    if (this._offset + byteCount > this._size) {
      throw new Error(
        `Read of ${byteCount} bytes at offset ${this._offset} exceeds buffer size ${this._size}`
      );
    }
  }

  public readInt16(littleEndian?: boolean): number {
    this._ensureBytes(2);
    const result = this._dataView.getInt16(this._offset, littleEndian);
    this._offset += 2;
    return result;
  }

  public readInt32(littleEndian?: boolean): number {
    this._ensureBytes(4);
    const result = this._dataView.getInt32(this._offset, littleEndian);
    this._offset += 4;
    return result;
  }

  public readInt32Array(count: number, littleEndian?: boolean): Int32Array {
    const result = new Int32Array(count);
    for (let i = 0; i < count; i++) {
      result[i] = this.readInt32(littleEndian);
    }
    return result;
  }

  public readDouble(littleEndian?: boolean): number {
    this._ensureBytes(8);
    const result = this._dataView.getFloat64(this._offset, littleEndian);
    this._offset += 8;
    return result;
  }

  public readDoubleArray(count: number, littleEndian?: boolean): Float64Array {
    const result = new Float64Array(count);
    for (let i = 0; i < count; i++) {
      result[i] = this.readDouble(littleEndian);
    }
    return result;
  }

  /* Returns value at curent pos without advancing */
  public peekByte(): number {
    this._ensureBytes(1);
    return this._dataView.getUint8(this._offset);
  }

  public readByte(): number {
    this._ensureBytes(1);
    const result = this._dataView.getUint8(this._offset);
    this._offset += 1;
    return result;
  }
}

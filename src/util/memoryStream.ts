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
    if (offset > this._size + 1) {
      throw new Error('Offset out of bounds');
    }
    this._offset = offset;
    return this;
  }

  public readInt16(littleEndian?: boolean): number {
    const result = this._dataView.getInt16(this._offset, littleEndian);
    this._offset += 4;
    return result;
  }

  public readInt32(littleEndian?: boolean): number {
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
    return this._dataView.getUint8(this._offset);
  }

  public readByte(): number {
    const result = this._dataView.getUint8(this._offset);
    this._offset += 1;
    return result;
  }
}

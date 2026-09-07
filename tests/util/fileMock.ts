export class FileMock implements File {
  private _buf: ArrayBuffer;

  constructor(buffer: ArrayBuffer) {
    this._buf = buffer;
    this.size = buffer.byteLength;
  }
  readonly lastModified = 0;
  readonly name = '';
  readonly size: number;
  readonly type = '';
  readonly webkitRelativePath = '';

  slice(_start?: number, _end?: number, _contentType?: string): Blob {
    throw new Error('Method not implemented.');
  }
  stream(): ReadableStream<Uint8Array<ArrayBuffer>> {
    throw new Error('Method not implemented.');
  }
  text(): Promise<string> {
    throw new Error('Method not implemented.');
  }
  bytes(): Promise<Uint8Array<ArrayBuffer>> {
    throw new Error('Method not implemented.');
  }

  public async arrayBuffer(): Promise<ArrayBuffer> {
    return this._buf;
  }
}

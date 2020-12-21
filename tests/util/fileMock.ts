export class FileMock implements File {
  private _buf: ArrayBuffer;

  constructor(buffer: ArrayBuffer) {
    this._buf = buffer;
  }
  lastModified: number;
  name: string;
  size: number;
  type: string;

  slice(start?: number, end?: number, contentType?: string): Blob {
    throw new Error("Method not implemented.");
  }
  stream(): ReadableStream<any> {
    throw new Error("Method not implemented.");
  }
  text(): Promise<string> {
    throw new Error("Method not implemented.");
  }

  public async arrayBuffer(): Promise<ArrayBuffer> {
    return this._buf;
  }
}

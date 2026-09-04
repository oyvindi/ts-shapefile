import { expect } from 'vitest';
import * as fs from 'fs';
import { FileMock } from './fileMock';

const toArrayBuffer = (buf: Uint8Array): ArrayBuffer => {
  const ab = new ArrayBuffer(buf.length);
  const view = new Uint8Array(ab);
  for (let i = 0; i < buf.length; ++i) {
    view[i] = buf[i];
  }
  return ab;
};

export const openTestFile = async (name: string): Promise<FileMock> => {
  const filePath = `./testdata/${name}`;
  try {
    const buf = await fs.promises.readFile(filePath);
    return new FileMock(toArrayBuffer(buf));
  } catch (err) {
    console.error(`Failed to open ${filePath}`);
    throw err;
  }
};

export const assertThrows = async (func: () => Promise<void>, expectedMessage: string) => {
  await expect(func()).rejects.toThrow(expectedMessage);
};

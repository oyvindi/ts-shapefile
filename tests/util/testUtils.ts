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

const readBuffer = async (name: string): Promise<ArrayBuffer> => {
  const filePath = `./testdata/${name}`;
  try {
    const buf = await fs.promises.readFile(filePath);
    return toArrayBuffer(buf);
  } catch (err) {
    console.error(`Failed to open ${filePath}`);
    throw err;
  }
};

export const openTestFile = async (name: string): Promise<FileMock> => {
  return new FileMock(await readBuffer(name));
};

export const openTestBuffer = async (name: string): Promise<ArrayBuffer> => {
  return readBuffer(name);
};

export const assertThrows = async (func: () => Promise<void>, expectedMessage: string) => {
  await expect(func()).rejects.toThrow(expectedMessage);
};

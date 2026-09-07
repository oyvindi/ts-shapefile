import { CpLUT } from './codePageLUT';
import { sbcsTables } from './sbcsTables';

// ESRI article on encoding: https://support.esri.com/en/technical-article/000013192
// "If a dBASE file lacks an LDID or a .CPG file, it assumes the file is encoded in the Windows (ANSI/Multi-byte) code page."
//
// Arcgis produces CPG-files (containing one string) for ISO, ANSI and UTF-8 mode. For OEM, the CP is set in the DBF header.
// Example CPG string:
// ANSI:   "ANSI 1252"
// ISO:    "ISO 88591"
// UTF-8:  "UTF-8"

const regExAnsi = /^.*ANSI\s*(\d+)\s*$/;
const regExIso = /^.*ISO\s*8859(\d)\s*$/;
const regExUTF8 = /^.*UTF[-\s]?8\s*$/;

export interface DbfDecoder {
  readonly encoding: string;

  decode(str: Uint8Array): string;
}

// Map of cp-style encoding names to TextDecoder labels, for encodings the
// WHATWG Encoding standard covers natively. TextDecoder handles these in both
// Node and browsers without any dependency. Encodings not listed here and not
// present in sbcsTables are unsupported.
const textDecoderLabels: Record<string, string> = {
  utf8: 'utf-8',
  cp1250: 'windows-1250',
  cp1251: 'windows-1251',
  cp1252: 'windows-1252',
  cp1253: 'windows-1253',
  cp1254: 'windows-1254',
  cp1255: 'windows-1255',
  cp1256: 'windows-1256',
  cp1257: 'windows-1257',
  cp932: 'shift_jis',
  cp936: 'gbk',
  cp949: 'euc-kr',
  cp950: 'big5',
  cp866: 'ibm866',
  cp874: 'windows-874',
  cp10000: 'macintosh',
  cp10007: 'x-mac-cyrillic',
};

// ISO-8859-N is handled directly: the encoding name (e.g. "ISO-8859-1") is a
// valid TextDecoder label as-is (case-insensitive).
const regExIsoEncoding = /^ISO-8859-\d+$/;

// Cache of which TextDecoder labels the runtime actually supports. Most are
// guaranteed by the WHATWG Encoding standard, but support can vary (e.g.
// x-mac-*), so we probe once and remember.
const supportedLabels = new Map<string, boolean>();
function labelSupported(label: string): boolean {
  let ok = supportedLabels.get(label);
  if (ok === undefined) {
    try {
      new TextDecoder(label);
      ok = true;
    } catch {
      ok = false;
    }
    supportedLabels.set(label, ok);
  }
  return ok;
}

class TextDecoderDecoder implements DbfDecoder {
  public readonly encoding: string;
  private readonly _decoder: TextDecoder;

  constructor(encoding: string, label: string) {
    this.encoding = encoding;
    this._decoder = new TextDecoder(label);
  }

  decode(str: Uint8Array): string {
    return this._decoder.decode(str);
  }
}

class SbcsTableDecoder implements DbfDecoder {
  public readonly encoding: string;
  private readonly _table: string;

  constructor(encoding: string, chars: string) {
    this.encoding = encoding;
    if (chars.length === 128) {
      // Prepend ASCII 0-127; the table only covers the upper half.
      let ascii = '';
      for (let i = 0; i < 128; i++) {
        ascii += String.fromCharCode(i);
      }
      this._table = ascii + chars;
    } else {
      this._table = chars;
    }
  }

  decode(str: Uint8Array): string {
    let out = '';
    for (let i = 0; i < str.length; i++) {
      out += this._table[str[i]];
    }
    return out;
  }
}

// Resolve a cp-style encoding name to a decoder, or throw if unsupported.
function createDecoder(encoding: string): DbfDecoder {
  const sbcs = sbcsTables[encoding];
  if (sbcs !== undefined) {
    return new SbcsTableDecoder(encoding, sbcs);
  }
  let label = textDecoderLabels[encoding];
  if (label === undefined && regExIsoEncoding.test(encoding)) {
    label = encoding;
  }
  if (label !== undefined && labelSupported(label)) {
    return new TextDecoderDecoder(encoding, label);
  }
  throw new Error(`Encoding ${encoding} not supported`);
}

function encodingExists(encoding: string): boolean {
  if (sbcsTables[encoding] !== undefined) {
    return true;
  }
  let label = textDecoderLabels[encoding];
  if (label === undefined && regExIsoEncoding.test(encoding)) {
    label = encoding;
  }
  return label !== undefined && labelSupported(label);
}

export class DbfDecoderFactory {
  public static fromCpgString(cpg: string): DbfDecoder {
    if (!cpg) {
      throw new Error('No codepage/CPG string provided');
    }
    if (cpg.match(regExUTF8)) {
      return createDecoder('utf8');
    }
    let m = cpg.match(regExIso);
    if (m != null) {
      return createDecoder(`ISO-8859-${m[1]}`);
    }
    m = cpg.match(regExAnsi);
    if (m != null) {
      const code = parseInt(m[1]);
      const encoding = `cp${code}`;
      if (!encodingExists(encoding)) {
        throw new Error(`Encoding ${encoding} not supported`);
      }
      return createDecoder(encoding);
    }
    return createDecoder('cp1252');
  }

  public static fromDbfLangCode(code: number): DbfDecoder {
    if (code === 0) {
      // Default = 1252
      return createDecoder('cp1252');
    }
    if (code in CpLUT) {
      const cpId = CpLUT[code][0] as number;
      const encoding = `cp${cpId}`;
      if (!encodingExists(encoding)) {
        throw new Error(`Encoding ${encoding} not supported`);
      }
      return createDecoder(encoding);
    }
    throw new Error(`Could not find converter for codepage ${code}`);
  }
}

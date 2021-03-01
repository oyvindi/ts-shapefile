import { CpLUT } from './codePageLUT';
import { encodingExists, decode } from 'iconv-lite';
import 'buffer';

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

class IconvDecoder implements DbfDecoder {
  public readonly encoding: string;

  constructor(encoding: string) {
    this.encoding = encoding;
  }

  decode(str: Buffer): string {
    return decode(str, this.encoding);
  }
}

export class DbfDecoderFactory {
  public static fromCpgString(cpg: string): DbfDecoder {
    if (!cpg) {
      throw new Error('No codepage/CPG string provided');
    }
    if (cpg.match(regExUTF8)) {
      return new IconvDecoder('utf8');
    }
    let m = cpg.match(regExIso);
    if (m != null) {
      return new IconvDecoder(`ISO-8859-${m[1]}`);
    }
    m = cpg.match(regExAnsi);
    if (m != null) {
      const code = parseInt(m[1]);
      const encoding = `cp${code}`;
      if (!encodingExists(encoding)) {
        throw new Error(`Encoding ${encoding} not supported`);
      }
      return new IconvDecoder(encoding);
    }
    return new IconvDecoder('cp1252');
  }

  public static fromDbfLangCode(code: number): DbfDecoder | undefined {
    if (code === 0) {
      // Default = 1252
      return new IconvDecoder('cp1252');
    }
    if (code in CpLUT) {
      const cpId = CpLUT[code][0] as number;
      const encoding = `cp${cpId}`;
      if (!encodingExists(encoding)) {
        throw new Error(`Encoding ${encoding} not supported`);
      }
      return new IconvDecoder(encoding);
    }
    throw new Error(`Could not find converter for codepage ${code}`);
  }
}

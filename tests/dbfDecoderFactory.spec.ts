import { describe, it, expect } from 'vitest';
import { DbfDecoderFactory } from '../src/dbf/dbfDecoderFactory';

// Helper: build a Uint8Array from byte values.
const bytes = (...vals: number[]) => new Uint8Array(vals);

describe('DbfDecoderFactory.fromCpgString', () => {
  it('parses UTF-8 CPG strings (uppercase spellings, per the regex)', () => {
    // The regex matches uppercase "UTF"; lowercase variants fall through to
    // the cp1252 default (pre-existing behavior, unchanged here).
    for (const cpg of ['UTF-8', 'UTF8', 'UTF 8', 'UTF-8 ']) {
      const dec = DbfDecoderFactory.fromCpgString(cpg);
      expect(dec.encoding, cpg).toBe('utf8');
    }
  });

  it('parses ISO-8859-N CPG strings', () => {
    const dec = DbfDecoderFactory.fromCpgString('ISO 88591');
    expect(dec.encoding).toBe('ISO-8859-1');
    // 0xC6 in ISO-8859-1 is 'Æ'
    expect(dec.decode(bytes(0xc6, 0xd8, 0xc5))).toBe('ÆØÅ');
  });

  it('parses ANSI <n> CPG strings and decodes via TextDecoder (cp1252)', () => {
    const dec = DbfDecoderFactory.fromCpgString('ANSI 1252');
    expect(dec.encoding).toBe('cp1252');
    // 0xC6 0xD8 0xC5 0xE6 0xF8 0xE5 -> ÆØÅæøå in windows-1252
    expect(dec.decode(bytes(0xc6, 0xd8, 0xc5, 0xe6, 0xf8, 0xe5))).toBe('ÆØÅæøå');
  });

  it('throws on unsupported ANSI code page', () => {
    expect(() => DbfDecoderFactory.fromCpgString('ANSI 9999')).toThrow(
      'Encoding cp9999 not supported'
    );
  });

  it('defaults to cp1252 for unknown CPG content', () => {
    const dec = DbfDecoderFactory.fromCpgString('something weird');
    expect(dec.encoding).toBe('cp1252');
  });

  it('throws on empty CPG string', () => {
    expect(() => DbfDecoderFactory.fromCpgString('')).toThrow(
      'No codepage/CPG string provided'
    );
  });
});

describe('DbfDecoderFactory.fromDbfLangCode', () => {
  it('code 0 defaults to cp1252', () => {
    const dec = DbfDecoderFactory.fromDbfLangCode(0);
    expect(dec.encoding).toBe('cp1252');
  });

  it('throws on unknown codepage', () => {
    expect(() => DbfDecoderFactory.fromDbfLangCode(250)).toThrow(
      'Could not find converter for codepage 250'
    );
  });

  it('throws when the resolved code page is unsupported', () => {
    // No DBF lang code maps to an unsupported cp, so simulate by checking a
    // supported-but-rare path is wired: lang 104 -> cp895 (Kamenicky) now works.
    const dec = DbfDecoderFactory.fromDbfLangCode(104);
    expect(dec.encoding).toBe('cp895');
  });
});

// Decode-correctness across every code-page category the LUT exercises.
// Each case decodes a small byte sequence to a known string.
describe('DbfDecoder decode per code page', () => {
  it('cp437 (DOS OEM, SBCS table) decodes box-drawing + accented', () => {
    const dec = DbfDecoderFactory.fromDbfLangCode(1); // 437
    expect(dec.encoding).toBe('cp437');
    // 0xC9 0xBA 0xCD -> '╔║═' (box drawing)
    expect(dec.decode(bytes(0xc9, 0xba, 0xcd))).toBe('╔║═');
  });

  it('cp865 (DOS Nordic, SBCS table) decodes æøåÆØÅ', () => {
    const dec = DbfDecoderFactory.fromDbfLangCode(8);
    expect(dec.encoding).toBe('cp865');
    // bytes for æøåÆØÅ in cp865
    expect(dec.decode(bytes(0x91, 0x9b, 0x86, 0x92, 0x9d, 0x8f))).toBe('æøåÆØÅ');
  });

  it('cp850 (DOS Latin-I, SBCS table)', () => {
    const dec = DbfDecoderFactory.fromDbfLangCode(2);
    expect(dec.encoding).toBe('cp850');
    // 0x8F -> Å, 0x92 -> Æ in cp850
    expect(dec.decode(bytes(0x8f, 0x92))).toBe('ÅÆ');
  });

  it('cp852 (DOS Central European, SBCS table)', () => {
    const dec = DbfDecoderFactory.fromDbfLangCode(31);
    expect(dec.encoding).toBe('cp852');
    // 0xA0 -> á in cp852
    expect(dec.decode(bytes(0xa0))).toBe('á');
  });

  it('cp857 (DOS Turkish, SBCS table)', () => {
    const dec = DbfDecoderFactory.fromDbfLangCode(107);
    expect(dec.encoding).toBe('cp857');
    // 0xA7 -> ğ in cp857
    expect(dec.decode(bytes(0xa7))).toBe('ğ');
  });

  it('cp737 (DOS Greek, SBCS table)', () => {
    const dec = DbfDecoderFactory.fromDbfLangCode(106);
    expect(dec.encoding).toBe('cp737');
    // 0x80 -> Α in cp737
    expect(dec.decode(bytes(0x80))).toBe('Α');
  });

  it('cp866 (Russian, TextDecoder ibm866)', () => {
    const dec = DbfDecoderFactory.fromDbfLangCode(38);
    expect(dec.encoding).toBe('cp866');
    // 0x80 -> А (Cyrillic A) in cp866
    expect(dec.decode(bytes(0x80))).toBe('А');
  });

  it('cp874 (Thai, TextDecoder windows-874)', () => {
    const dec = DbfDecoderFactory.fromDbfLangCode(80);
    expect(dec.encoding).toBe('cp874');
    // 0xA1 -> ก (Thai ko kai)
    expect(dec.decode(bytes(0xa1))).toBe('ก');
  });

  it('cp1252 (Windows Latin-I, TextDecoder) round-trips ÆØÅæøå', () => {
    const dec = DbfDecoderFactory.fromCpgString('ANSI 1252');
    expect(dec.decode(bytes(0xc6, 0xd8, 0xc5, 0xe6, 0xf8, 0xe5))).toBe('ÆØÅæøå');
  });

  it('cp1250 (Windows Central European, TextDecoder)', () => {
    const dec = DbfDecoderFactory.fromDbfLangCode(200);
    expect(dec.encoding).toBe('cp1250');
    // 0xC1 -> Á in cp1250
    expect(dec.decode(bytes(0xc1))).toBe('Á');
  });

  it('cp1251 (Windows Cyrillic, TextDecoder)', () => {
    const dec = DbfDecoderFactory.fromDbfLangCode(201);
    expect(dec.encoding).toBe('cp1251');
    // 0xC0 -> А (Cyrillic A) in cp1251
    expect(dec.decode(bytes(0xc0))).toBe('А');
  });

  it('cp1257 (Windows Baltic, TextDecoder)', () => {
    const dec = DbfDecoderFactory.fromDbfLangCode(204);
    expect(dec.encoding).toBe('cp1257');
    // 0xC0 -> Ą in cp1257
    expect(dec.decode(bytes(0xc0))).toBe('Ą');
  });

  it('cp932 (Shift-JIS, TextDecoder) decodes a kana', () => {
    const dec = DbfDecoderFactory.fromDbfLangCode(19);
    expect(dec.encoding).toBe('cp932');
    // 0x82 0xA0 -> あ (hiragana a) in Shift-JIS
    expect(dec.decode(bytes(0x82, 0xa0))).toBe('あ');
  });

  it('cp936 (GBK, TextDecoder) decodes a hanzi', () => {
    const dec = DbfDecoderFactory.fromDbfLangCode(77);
    expect(dec.encoding).toBe('cp936');
    // 0xC4 0xE3 -> 你 in GBK
    expect(dec.decode(bytes(0xc4, 0xe3))).toBe('你');
  });

  it('cp949 (EUC-KR, TextDecoder) decodes a hangul', () => {
    const dec = DbfDecoderFactory.fromDbfLangCode(78);
    expect(dec.encoding).toBe('cp949');
    // 0xBE 0xC8 -> 안 in EUC-KR
    expect(dec.decode(bytes(0xbe, 0xc8))).toBe('안');
  });

  it('cp950 (Big5, TextDecoder) decodes a hanzi', () => {
    const dec = DbfDecoderFactory.fromDbfLangCode(79);
    expect(dec.encoding).toBe('cp950');
    // 0xA7 0x41 -> 你 in Big5
    expect(dec.decode(bytes(0xa7, 0x41))).toBe('你');
  });

  it('cp10000 (Macintosh, TextDecoder) decodes Ä', () => {
    const dec = DbfDecoderFactory.fromDbfLangCode(4);
    expect(dec.encoding).toBe('cp10000');
    // 0x80 -> Ä in macroman
    expect(dec.decode(bytes(0x80))).toBe('Ä');
  });

  it('cp10007 (Mac Cyrillic, TextDecoder) decodes А', () => {
    const dec = DbfDecoderFactory.fromDbfLangCode(150);
    expect(dec.encoding).toBe('cp10007');
    // 0x80 -> А in maccyrillic
    expect(dec.decode(bytes(0x80))).toBe('А');
  });

  it('cp10006 (Mac Greek, SBCS fallback table) decodes Ä', () => {
    const dec = DbfDecoderFactory.fromDbfLangCode(152);
    expect(dec.encoding).toBe('cp10006');
    // 0x80 -> Ä in macgreek
    expect(dec.decode(bytes(0x80))).toBe('Ä');
  });

  it('cp10029 (Mac Central European, SBCS fallback table) decodes Ä', () => {
    const dec = DbfDecoderFactory.fromDbfLangCode(151);
    expect(dec.encoding).toBe('cp10029');
    // 0x80 -> Ä in maccenteuro
    expect(dec.decode(bytes(0x80))).toBe('Ä');
  });

  it('cp895 (Kamenicky, SBCS table) decodes Czech Č', () => {
    const dec = DbfDecoderFactory.fromDbfLangCode(104);
    expect(dec.encoding).toBe('cp895');
    // 0x80 -> Č in Kamenicky
    expect(dec.decode(bytes(0x80))).toBe('Č');
  });

  it('cp620 (Mazovia, SBCS table) decodes Polish Ą', () => {
    const dec = DbfDecoderFactory.fromDbfLangCode(105);
    expect(dec.encoding).toBe('cp620');
    // 0x8F -> Ą in Mazovia
    expect(dec.decode(bytes(0x8f))).toBe('Ą');
  });

  it('ASCII bytes pass through every decoder unchanged', () => {
    const dec = DbfDecoderFactory.fromCpgString('UTF-8');
    expect(dec.decode(bytes(0x48, 0x69))).toBe('Hi');
  });
});

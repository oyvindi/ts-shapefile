export interface DbfDecoder {
    readonly encoding: string;
    decode(str: Uint8Array): string;
}
export declare class DbfDecoderFactory {
    static fromCpgString(cpg: string): DbfDecoder;
    static fromDbfLangCode(code: number): DbfDecoder;
}

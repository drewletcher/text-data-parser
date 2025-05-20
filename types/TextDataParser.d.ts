export default class TextDataParser {
    /**
     *
     * @param {Object}            [options]
     * @param {String|URL}        [options.url] the URL or local file name of the text data
     * @param {String|Uint8Array} [options.data] data in an array, instead of using url
     * @param {Readable}          [options.rs] readable stream with source data
     * @param {String}            [options.encoding] file encoding, default "utf8"
     * @param {String}            [options.separator] field separator value, default ','
     * @param {String}            [options.quote] quote character value, default '""
     */
    constructor(options?: {
        url?: string | URL | undefined;
        data?: string | Uint8Array<ArrayBufferLike> | undefined;
        rs?: any;
        encoding?: string | undefined;
        separator?: string | undefined;
        quote?: string | undefined;
    });
    options: {
        separator: string;
        quote: string;
    } & {
        url?: string | URL | undefined;
        data?: string | Uint8Array<ArrayBufferLike> | undefined;
        rs?: Readable;
        encoding?: string | undefined;
        separator?: string | undefined;
        quote?: string | undefined;
    };
    separator: string;
    quote: string;
    checkBOM: boolean;
    rows: any[];
    count: number;
    started: boolean;
    paused: boolean;
    cancelled: boolean;
    close(): void;
    pause(): void;
    resume(): void;
    parse(): Promise<any[] | undefined>;
    rl: any;
    /**
     * Parse line into fields by looking for separator and quote characters.
     *
     * @param {String} line
     * @returns
     */
    parseLine(line: string): (string | null)[];
}
//# sourceMappingURL=TextDataParser.d.ts.map
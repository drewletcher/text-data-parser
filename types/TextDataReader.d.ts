export = TextDataReader;
declare class TextDataReader {
    /**
     *
     * @param {Object}      options
     * @param {URL|String}  options.url
     * @param {Uint8Array|String} options.data
     */
    constructor(options: {
        url: URL | string;
        data: Uint8Array | string;
    });
    options: {
        url: URL | string;
        data: Uint8Array | string;
    };
    _construct(callback: any): Promise<void>;
    parser: {
        options: {
            separator: string;
            quote: string;
        } & {
            url?: string | URL | undefined;
            data?: string | Uint8Array<ArrayBuffer> | undefined;
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
        parseLine(line: string): (string | null)[];
    } | undefined;
    _destroy(err: any, callback: any): void;
    /**
     * Fetch data from the underlying resource.
     * @param {*} size <number> Number of bytes to read asynchronously
     */
    _read(size: any): Promise<void>;
}
//# sourceMappingURL=TextDataReader.d.ts.map
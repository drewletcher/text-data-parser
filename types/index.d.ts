export const TextDataParser: {
    new (options?: {
        url?: string | URL | undefined;
        data?: string | Uint8Array<ArrayBuffer> | undefined;
        rs?: any;
        encoding?: string | undefined;
        separator?: string | undefined;
        quote?: string | undefined;
    }): {
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
    };
};
export const TextDataReader: {
    new (options: {
        url: URL | string;
        data: Uint8Array | string;
    }): import("./TextDataReader.js");
};
export const RowAsObjectTransform: {
    new (options?: {
        hasHeader?: Object | undefined;
        headers?: string[] | undefined;
    }): {
        headers: any;
        hasHeader: any;
        _transform(row: Object, encoding: string, callback: Function): void;
        _headers: Object | undefined;
    };
};
export const FormatCSV: {
    new (options: any): {
        first: boolean;
        _transform(row: Object, encoding: string, callback: Function): void;
    };
};
export const FormatJSON: {
    new (options: any): {
        options: any;
        first: boolean;
        _transform(row: Object, encoding: string, callback: Function): void;
        _flush(callback: Function): void;
    };
};
//# sourceMappingURL=index.d.ts.map
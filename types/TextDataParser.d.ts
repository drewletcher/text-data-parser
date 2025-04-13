declare const _exports: {
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
        /**
         * Parse line into fields by looking for separator and quote characters.
         *
         * @param {String} line
         * @returns
         */
        parseLine(line: string): (string | null)[];
    };
};
export = _exports;
//# sourceMappingURL=TextDataParser.d.ts.map
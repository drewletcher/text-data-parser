export default class TextDataReader {
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
    parser: TextDataParser | undefined;
    _destroy(err: any, callback: any): void;
    /**
     * Fetch data from the underlying resource.
     * @param {*} size <number> Number of bytes to read asynchronously
     */
    _read(size: any): Promise<void>;
}
import TextDataParser from './TextDataParser.js';
//# sourceMappingURL=TextDataReader.d.ts.map
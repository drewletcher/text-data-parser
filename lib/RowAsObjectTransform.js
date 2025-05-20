/**
 * lib/RowAsObjectTransform.js
 */
"use strict";

import { Transform } from 'node:stream';

/**
 * Transforms rows of data to JSON objects.
 */
export default class RowAsObjectTransform extends Transform {

  /**
   * If options.headers is not set then the first row seen is assumed to be headers.
   *
   * @param {Object}    [options]
   * @param {Object}    [options.hasHeader] - data has a header row, if true and headers set then headers overrides header row.
   * @param {String[]}  [options.headers]   - array of column names for data, default none first row contains names.
   */
  constructor(options = {}) {
    let streamOptions = {
      objectMode: true
    };
    super(streamOptions);

    this.headers = options.headers || options.RowAsObject?.headers || options[ "RowAsObject.headers" ] || [];

    if (Object.hasOwn(options, "hasHeader"))
      this.hasHeader = options.hasHeader;
    else if (options.RowAsObject && Object.hasOwn(options.RowAsObject, "hasHeader"))
      this.hasHeader = options.RowAsObject.hasHeader;
    else if (Object.hasOwn(options, "RowAsObject.hasHeader"))
      this.hasHeader = options[ "RowAsObject.hasHeader" ];
    else
      this.hasHeader = !this.headers?.length;  // backwards compatibility

    this._headers;  // internal header row
  }

  /**
   * Internal call from stream Transform to process an object
   * @param {Object} row
   * @param {String} encoding
   * @param {Function} callback
   */
  _transform(row, encoding, callback) {
    if (this.hasHeader && !this._headers) {
      this._headers = row;  // grab first row so it is not forwarded
      if (!this.headers?.length)
        this.headers = row; // use row as headers
    }
    else {
      let obj = {};
      for (let i = 0; i < row.length; i++) {
        let prop = this.headers[ i ] || i;
        obj[ prop ] = row[ i ];
      }
      this.push(obj);
    }
    callback();
  }

/*
  _flush(callback) {
    callback();
  }
*/
};

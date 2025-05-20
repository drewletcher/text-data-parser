
/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/
 */
/**
 * lib/TextDataReader
 */
"use strict";

import TextDataParser from './TextDataParser.js';
import { Readable } from 'node:stream';

export default class TextDataReader extends Readable {

  /**
   *
   * @param {Object}      options
   * @param {URL|String}  options.url
   * @param {Uint8Array|String} options.data
   */
  constructor(options) {
    let streamOptions = {
      objectMode: true,
      highWaterMark: 16,
      autoDestroy: false
    };
    super(streamOptions);

    this.options = options || {};
    this.parser;
  }

  async _construct(callback) {
    let parser = this.parser = new TextDataParser(this.options);
    var self = this;

    parser.on('data', (row) => {
      if (row) {
        if (!self.push(row)) {
          parser.pause();
        }
      }
    });

    parser.on('end', () => {
      self.push(null);
    });

    parser.on('error', (err) => {
      self.push(null);
      console.error(err);
    });

    callback();
  }

  _destroy(err, callback) {
    if (this.parser)
      this.parser.close();
    callback();
  }

  /**
   * Fetch data from the underlying resource.
   * @param {*} size <number> Number of bytes to read asynchronously
   */
  async _read(size) {
    // ignore size
    try {
      if (!this.parser.started)
        this.parser.parse();
      else
        this.parser.resume();
    }
    catch (err) {
      this.push(null);
    }
  }

};

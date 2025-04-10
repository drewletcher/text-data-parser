/**
 * lib/TextDataParser.js
 *
 * Parse text file where each line is row data.
 *
 * Output is an array of arrays.
 */
"use strict";

const EventEmitter = require('node:events');
const { once } = require('node:events');
const readline = require('node:readline/promises');
const fs = require('node:fs');
const httpRequest = require('./httpRequest');
const { Readable } = require('node:stream');
const { finished } = require('node:stream/promises')
require('colors');

module.exports = exports = class TextDataParser extends EventEmitter {

  /**
   *
   * @param {*} options
   * @param {String|URL}        [options.url] - the URL or local file name of the text data
   * @param {String|Uint8Array} [options.data] - data in an array, instead of using url
   * @param {string}   [options.separator] field separator value, default ','
   * @param {string}   [options.quote] quote character value, default '""
   */
  constructor(options = {}) {
    super({ captureRejections: true });

    this.options = Object.assign({ separator: ',', quote: '"', trim: true }, options);

    this.separator = options?.separator || ",";
    this.quote = options?.quote || '"';
    this.checkBOM = true;

    // parsing properties
    this.rows = [];
    this.rowNum = 0;

    // parser state
    this.started = false;
    this.paused = false;
    this.cancelled = false;

    this.parser;
  }

  async parse() {

    try {
      this.started = true;

      // open the input stream
      // pipe is supported, and it's readable/writable
      // same chunks coming in also go out.
      var rs;
      if (this.options.data) {
        rs = Readable.from(this.options.data);
      }
      else if (this.options.url.toLowerCase().startsWith("http")) {
        rs = await httpRequest.createReadStream(this.options.url, this.options.http);
        if (rs.statusCode !== 200) {
          rs.resume();  // drain the stream
          throw new Error("404 file not found " + this.options.url);
        }
      }
      else {
        rs = fs.createReadStream(this.options.url);
      }

      rs.setEncoding(this.options.fileEncoding || "utf8");

      rs.on('close', () => {
        console.debug("text reader close")
      });

      rs.on('end', () => {
        console.debug("text reader end")
      });

      rs.on('error',
        (err) => {
          console.warn(err);
        }
      );

      var reader = this;
      var count = this.options?.pattern?.count || this.options?.count || -1;

      // create the parser
      const parser = this.parser = readline.createInterface({
        input: rs,
        crlfDelay: Infinity,
      });

      // eslint-disable-next-line arrow-parens
      parser.on('line', (line) => {
        if (line) {
          this.rowNum++;
          let row = reader.parseLine(line);

          if (this.listenerCount("data") > 0)
            this.emit("data", row);
          else
            this.rows.push(row);
        }
      });

      parser.on('pause', () => {
        console.debug("text-reader pause");
      });

      parser.on('resume', () => {
        console.debug("text-reader resume");
      });

      parser.on('close', () => {
        this.emit("end");
      });

      if (this.listenerCount("data") === 0)
        await once(parser, 'close');

      return this.rows;
    }
    catch (err) {
      //console.error(err);
      this.emit("error", err);
    }
  }

  /**
   * Parse line into fields by looking for separator and quote characters.
   *
   * @param {String} line
   * @returns
   */
  parseLine(line) {
    let row = [];
    let value = [];

    const iterator = line[ Symbol.iterator ]();
    let ch = iterator.next();

    if (this.checkBOM) {
      // Byte Order Mark, file starts with 0xFEFF
      if (!ch.done && (ch.value.charCodeAt(0) === 0xFEFF)) {
        ch = iterator.next();
      }
      this.checkBOM = false;
    }

    while (!ch.done) {
      let quoted = false;
      if (ch.value === this.quote) {
        quoted = true;
        ch = iterator.next();

        while (!ch.done && ch.value !== this.quote) {
          value.push(ch.value);
          ch = iterator.next();
        }
        if (!ch.done)
          ch = iterator.next();
      }

      while (!ch.done && ch.value !== this.separator) {
        value.push(ch.value);
        ch = iterator.next();
      }

      row.push((value.length || quoted) ? value.join("") : null);
      value.length = 0;

      if (!ch.done && ch.value === this.separator) {
        ch = iterator.next();
        if (ch.done)
          row.push((value.length || quoted) ? value.join("") : null);
      }
      else if (!ch.done)
        throw "TextReader invalid character found: " + ch.value;
    }

    return row;
  }

};

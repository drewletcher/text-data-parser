/**
 * lib/TextDataParser.js
 *
 * Parse text file where each line is row data.
 *
 * Output is an array of arrays.
 */

import EventEmitter from 'node:events';
import { once } from 'node:events';
import readline from 'node:readline';
import fs from 'node:fs';
import { Readable } from 'node:stream';
import httpRequest from './httpRequest.js';

export default class TextDataParser extends EventEmitter {

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
  constructor(options = {}) {
    super({ captureRejections: true });

    this.options = Object.assign({ separator: ',', quote: '"' }, options);

    this.separator = this.options?.separator;
    this.quote = this.options?.quote;
    this.checkBOM = true;

    // parsing properties
    this.rows = [];
    this.count = 0;

    // readline state
    this.started = false;
    this.paused = false;
    this.cancelled = false;

    this.rl;
  }

  close() {
    if (this.rl)
      this.rl.close();
  }

  pause() {
    if (this.rl)
      this.rl.pause();
  }

  resume() {
    if (this.rl)
      this.rl.resume();
  }

  async parse() {
    if (this.started)
      return;

    try {
      this.started = true;

      // get input stream
      var rs;
      if (this.options.rs) {
        rs = this.options.rs;
      }
      else if (this.options.data) {
        rs = Readable.from(this.options.data);
      }
      else if (typeof this.options?.url === "string" && !this.options?.url.toLowerCase().startsWith("http")){
        rs = fs.createReadStream(this.options.url);
      }
      else {
        // assume http|https
        rs = await httpRequest.createReadStream(this.options.url, this.options.http);
        if (rs.statusCode !== 200) {
          rs.resume();  // drain the stream
          throw new Error(rs.statusCode + " " + rs.statusMessage + " " + this.options.url);
        }
      }

      rs.setEncoding(this.options.encoding || "utf8");

      rs.on('error',
        (err) => {
          console.warn(err);
        }
      );

      var self = this;

      // create the readline
      const rl = this.rl = readline.createInterface({
        input: rs,
        crlfDelay: Infinity,
      });

      // eslint-disable-next-line arrow-parens
      rl.on('line', (line) => {
        if (line) {
          this.count++;
          let row = self.parseLine(line);

          if (this.listenerCount("data") > 0)
            this.emit("data", row);
          else
            this.rows.push(row);
        }
      });

      rl.on('close', () => {
        this.emit("end");
      });

      rl.on('error', (err) => {
        //console.error(err);
        this.emit("error", err)
      });

      if (this.listenerCount("data") === 0)
        await once(rl, 'close');

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
        throw "TextDataParser invalid character found: " + ch.value;
    }

    return row;
  }

};

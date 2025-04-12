/**
 * lib/FormatJSON.js
 */

const { Transform } = require('stream');

/**
 * Simple transform of row objects to stringify'd array of objects.
 */
module.exports = exports = class FormatJSON extends Transform {

  constructor(options) {
    let streamOptions = {
      writableObjectMode: true,
      readableObjectMode: false
    };
    super(streamOptions);

    this.first = true;
  }

  /**
   * Internal call from streamWriter to process an object
   * @param {Object} row
   * @param {String} encoding
   * @param {Function} callback
   */
  _transform(row, encoding, callback) {
    if (this.first) {
      this.push("[\n");
      this.first = false;
    }
    else
      this.push(",\n");

    let text = JSON.stringify(row);
    this.push(text);

    callback();
  }

  /**
   *
   * @param {Function} callback
   */
  _flush(callback) {
    if (this.first)
      this.push("[\n");
    this.push("\n]\n");

    callback();
  }
};

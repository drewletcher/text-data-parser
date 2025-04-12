/**
 * lib/FormatCSV.js
 */

const { Transform } = require('stream');

/**
 * Simple transforms of row objects to CSV lines.
 */
module.exports = exports = class FormatCSV extends Transform {

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
      // output headers
      let text = "";
      let sep = "";
      for (let header of Object.keys(row)) {
        text = text + sep + '"' + header + '"';
        sep = ","
      }
      this.push(text + "\n");
      this.first = false;
    }

    // output headers
    let text = "";
    let sep = "";
    for (let value of Object.values(row)) {
      let delim = '"';
      text = text + sep + delim + value + delim;
      sep = ","
    }
    this.push(text + "\n");

    callback();
  }

/*
  _flush(callback) {
    callback();
  }
*/
};

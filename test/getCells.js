/**
 * test/saxStream
 *
 * Test SAX.js stream.
 */

const sax = require("sax");
const fs = require("node:fs");

var output = fs.openSync("./test/output/sax/getCells.json", "w");
fs.writeSync(output, "[\n");

//// table processing
var isTable = false;
var isRow = false;
var isCell = false;
var cellText = "";
var row = [];
var firstRow = true;

//// SAX parser
const strict = false; // set to false for Text mode
const options = {
  "trim": true
};

// stream usage
// takes the same options as the parser
var saxStream = sax.createStream(strict, options);

saxStream.on("error", function (e) {
  // unhandled error
  console.error("error: ", e)
  // clear the error
  this._parser.error = null
  this._parser.resume()
});

saxStream.on("end", function () {
  // stream has closed
  //fs.writeSync(output, "end:" + "\r\n");
  fs.writeSync(output, "\n]");
  fs.closeSync(output);
});

saxStream.on("ready", function () {
  // parser reset, ready to be reused.
  //fs.writeSync(output, "ready:" + "\r\n");
});

saxStream.on("doctype", function (s) {
  // doctype string
  //fs.writeSync(output, "doctype: " + JSON.stringify(s) + "\r\n");
});

saxStream.on("processinginstruction", function (o) {
  // object with "name", "body"
  //fs.writeSync(output, "processinginstruction: " + JSON.stringify(o) + "\r\n");
});

saxStream.on("comment", function (s) {
  // comment string
  //fs.writeSync(output, "comment: " + JSON.stringify(s) + "\r\n");
});

saxStream.on("opentagstart", function (node) {
  // node object with name, attributes (empty)
  //fs.writeSync(output, "opentagstart: " + JSON.stringify(node) + "\r\n");
});

saxStream.on("attribute", function (attr) {
  // attribute object with name, value
  //fs.writeSync(output, "attribute: " + JSON.stringify(attr) + "\r\n");
});

saxStream.on("opentag", function (node) {
  // node object with name, attributes, isSelfClosing
  //fs.writeSync(output, "opentag: " + JSON.stringify(node) + "\r\n");
  switch (node.name) {
    case "TABLE":
      isTable = true;
      break;
    case "TR":
      isRow = true;
      row = [];
      break;
    case "TH":
    case "TD":
      isCell = true;
      cellText = "";
      break;
  }
});

saxStream.on("text", function (s) {
  // inner text string
  //fs.writeSync(output, "text: " + s + "\r\n");
  if (isCell)
    cellText += s;
});

saxStream.on("closetag", function (tag) {
  // tag name
  //fs.writeSync(output, "closetag: " + tag + "\r\n");
  var sep = "";
  switch (tag) {
    case "TABLE":
      isTable = false;
      break;
    case "TR":
      isRow = false;
      sep = firstRow ? (firstRow = false) || "" : ",\n";
      fs.writeSync(output, sep + JSON.stringify(row));
      break;
    case "TH":
    case "TD":
      isCell = false;
      row.push(cellText);
      break;
  }
});

saxStream.on("opencdata", function (tag) {
  // tag name
  //fs.writeSync(output, "opencdata: " + tag + "\r\n");
});

saxStream.on("cdata", function (s) {
  // inner text string
  //fs.writeSync(output, "cdata: " + s + "\r\n");
});

saxStream.on("closecdata", function (tag) {
  // tag name
  //fs.writeSync(output, "closecdata: " + tag + "\r\n");
});

saxStream.on("script", function (s) {
  // script contents as string
  //fs.writeSync(output, "script: " + JSON.stringify(s) + "\r\n");
});


// pipe is supported, and it's readable/writable
// same chunks coming in also go out.
fs.createReadStream("./test/data/text/texas_jan2024.shtml")
  .pipe(saxStream);

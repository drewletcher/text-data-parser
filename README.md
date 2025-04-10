# text-data-parser 1.0.x

Parse and stream data from Text documents using Node.js.

This readme explains how to use text-data-parser in your code or as a stand-alone program.

Related projects: [text-data-parser](https://gitlab.com/drewletcher/text-data-parser#readme), [pdf-data-parser](https://gitlab.com/drewletcher/pdf-data-parser#readme), [xlsx-data-parser](https://gitlab.com/drewletcher/xlsx-data-parser#readme)

## Installation

For use as command line utility. Requires Node.js 18+.

```bash
npm -g install text-data-parser
```

For use as module in a Node.js project. See Developers Guide below.

```bash
npm install text-data-parser
```

## CLI Program

---

Parse tabular data from a Text document.

```bash
tdp [--options=filename.json] [--headers=name1,name2,...] [--format=json|csv|rows] <filename|URL> [<output-file>]

  `filename|URL` - path name or URL of Text file to process, required.
  `output-file`  - local path name for output of parsed data, default stdout.
  `--options`    - JSON or JSONC file containing JSON object with tdp options, optional.
  `--headers`    - comma separated list of column names for data, default none the first table row contains names.
  `--format`     - output data format JSON, CSV or rows (JSON arrays), default JSON.
```

Note: If the `tdp` command conflicts with another program on your system use `tdpdataparser` instead.

### Options File

The options file supports options for all text-data-parser modules. Parser will read plain JSON files or JSONC files with Javascript style comments.

```javascript
{
  /* TextDataParser options */

  // url - local path name or URL of Text file to process, required.
  "url": "",
  // output - local path name for output of parsed data, default stdout.
  "output": "",
  // format - output data format CSV, JSON or rows, default JSON, rows is JSON array of arrays (rows).
  "format": "json",
  // trim whitespace from output values, default: true.
  "trim": true,

  /* RowAsObjectTransform options */

  // hasHeaders - data has a header row, if true and headers set then headers overrides header row.
  "RowAsObject.hasHeader": true
  // headers - comma separated list of column names for data, default none. When not defined the first table row encountered will be treated as column names.
  "RowAsObject.headers": []

  /* HTTP options */
  // see HTTP Options below

}
```

Note: Transform property names can be shortened to `hasHeader`, `headers`, `column` and `header`.

### Examples

```bash
tdp ./test/data/text/helloworld.text --headers="Greeting" --format=csv
```

```bash
tdp ./test/data/text/helloworld.text --headers="BigBang"
```

```bash
tdp ./test/data/text/foo_data.txt  --separator="\t"
```

```bash
tdp https://www.sos.state.tx.us/elections/historical/jan2024.shtml ./test/output/tdp/tx_voter_reg.json
```

## Developer Guide

---

### TextDataParser

TextDataParser given a Text document will output an array of arrays (rows). Additionally, use the streaming classes TextDataReader and RowAsObjectTransform transform to convert the arrays to Javascript objects.  With default settings TextDataParser will parse .csv files. Using [TextDataParser Options]

Rows and Cells terminology is used instead of Rows and Columns because the content in a Text document flows rather than strict rows/columns of database query results. Some rows may have more cells than other rows. For example a heading or description paragraph will be a row (array) with one cell (string).  See [Notes](#notes) below.

### Basic Usage

```javascript
const { TextDataParser } = require("text-data-parser");

let parser = new TextDataParser({url: "filename.text"});

async function parseDocument() {
  var rows = await parser.parse();
  // process the rows
}
```

### TextDataParser Options

TextDataParser constructor takes an options object with the following fields. One of `url` or `data` arguments is required.

`{String|URL} url` - The local path or URL of the Text document.

`{String|Uint8Array} data` - Text document in a string.

Common Options:

`{String} separator` - .

`{String} quote` - .

`{Boolean} trim` - trim whitespace from output values, default: true.

### HTTP Options

HTTP requests are mode using Node.js HTTP modules. See the source code file lib/httpRequest.js for more details.

`{Object} http` - options to pass thru to HTTP request
`{String} http.method` - HTTP method, default is "GET"
`{Object} http.params` - object containing URL querystring parameters.
`{Object} http.headers` - object containing HTTP headers
`{Array}  http.cookies` - array of HTTP cookie strings
`{String} http.auth` - string for Basic Authentication (Authorization header), i.e. "user:password".

## Streaming Usage

---

### TextDataReader

TextDataReader is a Node.js stream reader implemented with the Object mode option. It uses TextDataParser to stream one data row (array) per chunk.

```javascript
const { TextDataReader } = require("text-data-parser");

let reader = new TextDataReader({url: "filename.text"});
var rows = [];

reader.on('data', (row) => {
  rows.push(row)
});

reader.on('end', () => {
  // do something with the rows
});

reader.on('error', (err) => {
  // log error
})
```

### TextDataReader Options

TextDataReader constructor options are the same as [TextDataParser Options](#text-data-parser-options).

### RowAsObjectTransform

TextDataReader operates in Object Mode. The reader outputs arrays (rows). To convert rows into Javascript objects use the RowAsObjectTransform transform.  TextDataReader operates in Object mode where a chunk is a Javascript Object of <name,value> pairs.

```javascript
const { TextDataReader, RowAsObjectTransform } = require("text-data-parser");
const { pipeline } = require('node:stream/promises');

let reader = new TextDataReader(options);
let transform1 = new RowAsObjectTransform(options);
let writable = <some writable that can handle Object Mode data>

await pipeline(reader, transform1, writable);
```

### RowAsObjectTransform Options

RowAsObjectTransform constructor takes an options object with the following fields.

`{String[]} headers` - array of cell property names; optional, default: none. If a headers array is not specified then parser will assume the first row found contains cell property names.

`{Boolean} hasHeaders` - data has a header row, if true and headers options is set then provided headers override header row. Default is true.

If a row is encountered with more cells than in the headers array then extra cell property names will be the ordinal position. For example if the data contains five cells, but only three headers where specified.  Specifying `options = { headers: [ 'name', 'type', 'info' ] }` then the Javascript objects in the stream will contain `{ "name": "value1", "type": "value2", "info": "value3", "4": "value4", "5": "value5" }`.

### FormatCSV and FormatJSON

The `tdpdataparser` CLI program uses the FormatCSV and FormatJSON transforms to covert Javascript Objects into strings that can be saved to a file.

```javascript
const { TextDataReader, RowAsObjectTransform, FormatCSV } = require("text-data-parser");
const { pipeline } = require('node:stream/promises');

let reader = new TextDataReader(options);
let transform1 = new RowAsObjectTransform(options);
let transform2 = new FormatCSV();

await pipeline(reader, transform1, transform2, process.stdout);
```

## Examples

---

In the source code the text-data-parser.js program and the Javascript files in the /test folder are good examples of using the library modules.

### Hello World

[HelloWorld.text](./test/data/text/helloworld.text) is a single page Text document with the string "Hello, world!" positioned on the page. The TextDataParser output is one row with one cell.

```json
[
  ["Hello, world!"]
]
```

To transform the row array into an object specify the headers option to RowAsObjectTransform transform.

```javascript
let transform = new RowAsObjectTransform({
  headers: [ "Greeting" ]
})
```

Output as JSON objects:

```json
[
  { "Greeting": "Hello, world!" }
]
```

## Notes

---

* Options separator and quote default to ',' and '"' for parsing .csv files.

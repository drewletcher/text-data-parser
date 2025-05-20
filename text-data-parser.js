#!/usr/bin/env node
/* eslint-disable node/shebang */
/**
 * text-data-parser
 */
"use strict";

import TextDataReader from './lib/TextDataReader.js';
import RowAsObjectTransform from './lib/RowAsObjectTransform.js';
import FormatCSV from './lib/FormatCSV.js';
import FormatJSON from './lib/FormatJSON.js';
import Package from './package.json' with { type: 'json' };
import { parse } from 'jsonc-parser';
import colors from 'colors';

import { open, readFile } from 'node:fs/promises';
import { pipeline } from 'node:stream/promises';
import { stdout } from 'node:process';

colors.enable();

// default program options
var options = {
  url: "",
  output: "",
  format: "json"
}

/**
 * parseArgs
 *   only filename is required
 *   example ["node.exe", "text-data-parser.js", <filename.text|URL>, <output> "--headers=c1,c2,.." "--format=csv|json|rows" ]
 */
async function parseArgs() {
  let clOptions = {}; // command line options
  let ofOptions = {}; // options file options
  let optionsfile = "tdp.options.json";

  let i = 2;
  while (i < process.argv.length) {
    let arg = process.argv[ i ];

    if (arg[ 0 ] !== "-") {
      if (!clOptions.url)
        clOptions.url = arg;
      else
        clOptions.output = arg;
    }
    else {
      let nv = arg.split('=');

      if (nv[ 0 ] === "--options")
        optionsfile = nv[ 1 ];
      else if (nv[ 0 ] === "--separator")
        clOptions.separator = nv[ 1 ].replace(/\\t/g, "\t");
      else if (nv[ 0 ] === "--quote")
        clOptions.quote = nv[ 1 ];
      else if (nv[ 0 ].includes("--hasHeader"))
        clOptions.hasHeader = nv[ 1 ] == "true";
      else if (nv[ 0 ].includes("--headers"))
        clOptions.headers = nv[ 1 ].split(",");
      else if (nv[ 0 ] === "--format")
        clOptions.format = nv[ 1 ].toLowerCase();
    }
    ++i;
  }

  if (optionsfile) {
    try {
      let opts = await readFile(optionsfile, { encoding: 'utf8' });
      let perrors = [];
      let poptions = {
        disallowComments: false,
        allowTrailingComma: true,
        allowEmptyContent: false
      };
      ofOptions = parse(opts, perrors, poptions)
    }
    catch (err) {
      if (err.code !== 'ENOENT' || optionsfile != "tdp.options.json")
        throw err;
    }
  }

  Object.assign(options, ofOptions, clOptions);
}

/**
 * Program entry point.
 */
(async () => {
  let retCode = 0;

  await parseArgs();

  let stdoutput = options.output === "" || !options.url;

  if (!stdoutput) {
    console.log("tdp Text Data Parser " + Package.version);
    console.log("Copyright 2024 Drew O. Letcher | The MIT License");
  }

  if (!options.url) {
    console.log("");
    console.log("Parse tabular data from a Text file.");
    console.log("");
    console.log("tdp <filename.text|URL> <output-file> --options=filename.json --format=csv|json|rows");
    console.log("");
    console.log("  filename|URL - path name or URL of Text file to process, required.");
    console.log("  output-file  - local path name for output of parsed data, default stdout.");
    console.log("  --options    - JSON or JSONC file containing tdp options, default: tdp.options.json.");
    console.log("  --separator  - field separator value, default ','");
    console.log("  --quote      - quote character value, default '\"'");
    console.log("  --hasHeader  - first row of input are column names, default false.");
    console.log("  --headers    - comma separated list of column names for data, default none first table row contains names.");
    console.log("  --format     - output data format CSV, JSON, or ROW (JSON array of arrays), default JSON.");
    console.log("");
    return;
  }

  try {
    let pipes = [];

    let reader = new TextDataReader(options);
    pipes.push(reader);

    if (options?.format !== "rows") {
      let transform = new RowAsObjectTransform(options);
      pipes.push(transform);
    }

    let formatter = options?.format === "csv" ? new FormatCSV(options) : new FormatJSON(options);
    pipes.push(formatter);

    let writer;
    if (options.output) {
      let fd = await open(options.output, "w");
      writer = fd.createWriteStream();
    }
    else
      writer = process.stdout;
    pipes.push(writer);

    await pipeline(pipes);

    if (options.output)
      writer.end();
  }
  catch (err) {
    console.error(err.message.red);
    retCode = 1;
  }

  if (!stdoutput) {
    if (retCode === 0)
      console.log("parser results OK".green);
    else
      console.log(" parser failed.".red);
  }

  process.exitCode = retCode;
})();

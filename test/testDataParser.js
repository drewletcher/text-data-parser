/**
 * test/testDataParser.js
 */

const TextDataParser = require("../lib/TextDataParser");
const fs = require("fs");
const path = require("path");
const compareFiles = require("./_compareFiles");

async function test(options) {
  try {
    let outputName = path.parse(options.url || options.data).name;

    if (options.data) {
      options.data = fs.readFileSync(options.data);
      //options.data = new Uint8Array(fs.readFileSync(options.data));
      outputName += "_data";
    }

    let parser = new TextDataParser(options);
    let rows = await parser.parse();

    let outputFile = "./test/output/TextDataParser/" + outputName + ".json";
    console.log("output: " + outputFile);
    fs.mkdirSync(path.dirname(outputFile), { recursive: true });
    fs.writeFileSync(outputFile, JSON.stringify(rows, null, 2));

    let expectedFile = outputFile.replace("/output/", "/expected/");
    let exitCode = compareFiles(outputFile, expectedFile, 2);
    return exitCode;
  }
  catch (err) {
    console.error(err);
    return 1;
  }
}

(async () => {
  if (await test({
    url: "./test/data/text/helloworld.txt"
  })) return 1;

  if (await test({
    url: "./test/data/text/foo_data.txt",
    separator: "\t"
  })) return 1;

  if (await test({
    url: "http://dev.oby4.org/data/test/data/input/foo_cars.csv"
  })) return 1;

  // load file as options.data
  if (await test({
    data: "./test/data/text/helloworld.txt"
  })) return 1;

})();

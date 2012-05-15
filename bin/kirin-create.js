#!/usr/bin/env node


function usage () {
    throw new Error("Usage: kirin-create.js $templateName $directory");
}


var templateName = process.argv[2] || usage();
var directory = process.argv[3] || usage();


var progenitor = require("progenitor")
    path = require("path");
process.env["KIRIN_HOME"] = process.env["KIRIN_HOME"] || path.resolve(__dirname, "..");
var targetDir = path.resolve(process.cwd(), directory);
var kirinHomeRelative = path.relative(targetDir, process.env["KIRIN_HOME"]);
process.env["KIRIN_HOME_RELATIVE"] = kirinHomeRelative;
progenitor.prompt({
    templates: path.join(__dirname, "../templates"),
    dest: targetDir, 
    template: templateName,
    writeOptions: true
});

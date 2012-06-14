#!/usr/bin/env node
var kirinHomePath = require("path").resolve(__dirname, "..");

console.log("Creating ant library project files...");
var androidUpdateProjectCommand = "android update lib-project --path " + kirinHomePath + "/platforms/android/Kirin-Lib";
require('child_process').exec(androidUpdateProjectCommand, function(error, stdout, stderr) {
    console.log("Now tell Eclipse and XCode that KIRIN_HOME = " + kirinHomePath);
});

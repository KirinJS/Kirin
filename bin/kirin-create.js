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
}, function () {
    if (templateName === "app") {
        var path = require("path"),
            childProcess = require("child_process"),
            androidKirinHome = path.join(targetDir, "/platforms/android");

        childProcess.exec("android list | grep -o android-[0-9]* | sort | head -n 1", function (error, stdout, sterr) {
            var androidUpdateProjectCommand = "android update project --subprojects --path " + androidKirinHome + " --target " + stdout;
            console.log(androidUpdateProjectCommand);
            childProcess.exec(androidUpdateProjectCommand, function(error, stdout, stderr) {
                if (error !== null) {
                    console.error("Canot run android update project on the new android app", error);
                }
            });                
        });
        
        
    }
});

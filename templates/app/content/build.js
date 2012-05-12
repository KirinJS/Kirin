#!/usr/bin/env node
var kirin_home = process.env["KIRIN_HOME"] || require("path").resolve(__dirname, "__KIRIN_HOME_RELATIVE__");
if (!require("fs").existsSync(kirin_home)) {
	kirin_home=require("path").resolve(__dirname, "../../../Kirin");
}
if (require("fs").existsSync(kirin_home)) {
	process.env["KIRIN_HOME"] = kirin_home;
	require(kirin_home + "/build.js").build(process.argv, __dirname);
} else {
	console.error("Need to set environment variable KIRIN_HOME");
	process.exit(1);
}

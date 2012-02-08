#!/usr/bin/env node

var util = require("util");
var	maker = require("node-build");

maker.define("help").perform.echo("Hello world");
maker.define("help2").perform.echo("Hello world");



exports.build = function (args) {
	var i;
	if (args.length == 0) {
		maker.achieve("help");
	} else {
		for (i in args) {
			maker.achieve(args[i]);
		}
	}
}

exports.build(process.argv.splice(2));

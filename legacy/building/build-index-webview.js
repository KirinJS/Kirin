
var _ = require("underscore");
exports.templateFile = "index-ios.html";

exports.templateLine = "<script type='text/javascript' src='%FILENAME%' ></script>";

exports.buildIndexFile = function (moduleNames, dir) {
	var path = require("path");
	var fs = require("fs");
	var templateFilepath = path.join(__dirname, "..", "..", "lib", "index", exports.templateFile);
	
	if (!path.existsSync(templateFilepath)) {
		throw new Error("Can't find an existing template file " + templateFilepath);
	}
	
	var fileString = fs.readFileSync(templateFilepath).toString()		;
	
	var scriptTags = [];
	_.each(moduleNames, function (filepath) {
		scriptTags.push(exports.templateLine.replace("%FILENAME%", filepath));
	});

	fileString = fileString.replace("%INCLUDED_SCRIPTS%", scriptTags.join("\n"));

	var outfile = path.join(dir, exports.templateFile);
	fs.writeFileSync(outfile, fileString);
	return outfile;
}


"use strict";
var fs = require("fs"),
	_ = require("underscore"),
	path = require("path");

var dryRun = false;
var verbose = false;
exports.setDryRun = function (bool) {
	dryRun = bool;
	exports.dryRun = bool;
};
exports.setVerbose = function (bool) {
	verbose = bool;
	exports.verbose = bool;
};


function walkDirectory (filepath, callbacks) {
	function callCallback (callbacks, name, filepath) {
		var cb = callbacks[name];
		if (_.isFunction(cb)) {
			return cb(filepath);
		} else {
			return true;
		}		
	}


	if (!path.existsSync(filepath)) {
		return;
	}
	var info = fs.statSync(filepath);
	if (info.isDirectory()) {	
		if (callCallback(callbacks, "preTraversal", filepath)) {
			var files = fs.readdirSync(filepath);
			_.each(files, function (file) {
				walkDirectory(path.join(filepath, file), callbacks);
			});
			callCallback(callbacks, "postTraversal", filepath);
		}
	} else if (callCallback(callbacks, "testFile", filepath)) {
		callCallback(callbacks, "perFile", filepath);
	}
}
exports.walkDirectory = walkDirectory;

walkDirectory.createFilteredWalker = function (extensionPattern, exclusionsPattern) {
	extensionPattern = extensionPattern || /\.*$/;
	exclusionsPattern = exclusionsPattern || /(\.git|\.svn)$/;

	var extensionFunction = extensionPattern;
	if (_.isRegExp(extensionPattern)) {
		extensionFunction = function (filepath) {
			return extensionPattern.test(filepath);
		};
	}
	
	var walker = {
		preTraversal: function (dirpath) {
			return !exclusionsPattern.test(dirpath);
		},
		postTraversal: function (dirpath) {
						
		},
		testFile: function (filepath) {
			return true;
		}
	};
	
	walker.createSpecificFileTest = function (environment) {
		walker.testFile = function (filepath) {
			if (!extensionFunction(filepath)) {
				return false;
			}
			
			if (!environment.allVariantsRegexp.test(filepath)) {
				return true;
			}
			
			return environment.includeRegexp.test(filepath);
		};
	};
	
	return walker;
};

walkDirectory.createFileCopier = function (srcPath, destPath) {
	return function (filepath) {
		var newFilepath = filepath.replace(srcPath, destPath);
		mkdirs(path.dirname(newFilepath));
		if (dryRun || verbose) {
			console.log("cp " + filepath + " " + newFilepath);
		}
		if (!dryRun) {
			fs.linkSync(filepath, newFilepath);
		}
	};
};


function rmForce(dir) {
	if (dryRun || verbose) {
		console.log("rm -Rf " + dir);
	}
	if (dryRun) {
		return;
	}
	walkDirectory(dir, {
		perFile: function (file) {
			fs.unlinkSync(file);
		},
		postTraversal: function (dir) {
			fs.rmdirSync(dir);
		}
	});
}
exports.rmForce = rmForce;

function mkdirs(dirname) {

	var path = require("path");
	
	if (path.existsSync(dirname)) {
		return true;
	} else {
		mkdirs(path.dirname(dirname));
		if (dryRun || verbose) {
			console.log("mkdir " + dirname);
		}
		if (!dryRun) {
			fs.mkdirSync(dirname, "0755");
		}
		return true;
	}
}
exports.mkdirs = mkdirs;


function mkdirTemp (root, prefix, suffix) {
	if (!prefix) {
		prefix = "temp-";
	}
	if (!suffix) {
		suffix = "";
	}
	var name = prefix + new Date().getTime() + process.pid + suffix;
	var fullPath = path.join(root, name);
	if (path.existsSync(fullPath)) {
		return mkdirTemp(root, prefix, suffix);
	} else {
		mkdirs(fullPath);
		return fullPath;
	}
}
exports.mkdirTemp = mkdirTemp;

function writeLines (filepath, lines) {
	if (dryRun || verbose) {
		console.log("# writing " + filepath);
	}
	if (dryRun && verbose) {
		console.log(lines.join("\n"));
	}
	if (!dryRun) {
		fs.writeFileSync(filepath, lines.join("\n"));
	}
}
exports.writeLines = writeLines;
"use strict";
var _ = require("underscore");

// TODO split these keyword definitions into a seperate module.
exports.buildTypes = ['prod', 'dev', 'qa', 'stage', 'uitest'];

exports.supportedPlatforms = {
        "ios": ["webview", "webkit", "safari"],
        "android": ["webview", "webkit"],
        "wp7": ["webview", "ie"],
        "qt": ["javascript", "js"],
        "html": ["webview", "fakeNative"],
        "node": ["fakeNative"]
    };

exports.supportedPlatformClasses = _.unique(_.flatten(_.values(exports.supportedPlatforms)));

exports.allKeywords = _.union(exports.buildTypes, 
								_.keys(exports.supportedPlatforms),
								exports.supportedPlatformClasses);



exports.isValidConfiguration = function (platform, buildType) {
	return (exports.supportedPlatforms[platform] &&
		_.indexOf(exports.buildTypes, buildType) >= 0);
}


exports.filters = function (platform, buildType) {
	var negativeFilter = [];
	var positiveFilter = [];
	
	if (exports.buildTypes.indexOf(buildType) >= 0) {
		positiveFilter.push(buildType);
		negativeFilter = pushAll(negativeFilter, _.without(exports.buildTypes, buildType));
	}
	
	var platformClass = exports.supportedPlatforms[platform];

	if (platformClass) {
		positiveFilter.push(platform);
		positiveFilter = pushAll(positiveFilter, platformClass);
		negativeFilter = pushAll(negativeFilter, _.without(_.keys(exports.supportedPlatforms, platform)));
		negativeFilter = pushAll(negativeFilter, _.difference(exports.supportedPlatformClasses, platformClass));
	} 
	
	return {
		negative: negativeFilter,
		positive: positiveFilter,
		allVariants: exports.allKeywords
	};
};

function pushAll (l, r) {
	_.each(r, function (value) {
		l.push(value);
	});
	return l;
}


exports.runJSLint = function (dryRun, verbose) {
	var lintPath = require("path").join(__dirname, "./tools/jslint/lib/fulljslint_export.js");
	var JSLINT = require("./tools/jslint/lib/fulljslint_export.js").JSLINT;
	// TODO put these into a seperate file. 
	var jslint_config = require("./kirin-jslint-rules.js");
	var testtools = require("./kirin-testtools.js");
	var fs = require("fs");
	var numErrors = 0;
	var reDontCompress = /generated|lib|-min\.js/;
	_.each(testtools.getAllNonTestModulePathMapping(), function (filepath) {
		var code = fs.readFileSync(filepath);
		if (filepath.indexOf(".js") < 0) {
			return;
		}
        if (reDontCompress.test(filepath)) {
            return;
        }
		if (dryRun) {
			console.log("node " + lintPath + " " + filepath);
			return;
		}


		if (!JSLINT(code.toString("utf8"), jslint_config.jslintConfig)) {
			var lines = [];
			var errors = JSLINT.errors;
			_.each(errors, function (e) {
				if (e) {
					var sev;
					if (_.include(jslint_config.jslintToleratedReasons, e.reason)) {
						sev = "W";
					} else {
						numErrors ++;
						sev = "E";
					}
					if (sev === "E" || verbose) {
						lines.push(" " + sev + " " + e.line + "," + e.character + ": " + e.reason);
					}
				}
			});
			if (!_.isEmpty(lines)) {
				console.error("---------------------------------------");
				console.error(filepath + ": ");
				_.each(lines, function (line) {
					// not sure why I can't use console.error directly in the each argument
					console.error(line);
				});
			}
		}
		
	
	});

	return numErrors === 0;
};

exports.runCompiler = function (outputFilepath, callback, dryRun) {
	var path = require("path");
	var compilerPath = path.join(__dirname, "tools", "closure", "compiler.jar");
	if (!path.existsSync(compilerPath)) {
		return false;
	}
	var testtools = require("./kirin-testtools.js");
	var reDontCompress = /generated|lib|-min\.js/;
	var allFiles = _.values(testtools.getAllNonTestModulePathMapping());
	var files = _.filter(allFiles, function (f) {return !reDontCompress.test(f);});
	var file = files.join(" --js ");
	
	var javaPath = "java";
	if (process.env["JAVA_HOME"]) {
		javaPath = path.join(process.env["JAVA_HOME"], "bin", "java");
	}
	
	var cmd = [javaPath, "-jar", compilerPath, "--js", file, "--js_output_file", "\"" + outputFilepath + "\""].join(" ");
	if (dryRun) {
		console.log(cmd);
		callback("");
	} else {
		var cp = require("child_process");
		cp.exec(cmd, function(err, stdout, stderr) {
		  if (err) {
			console.error("Could not compile");
			console.error(stderr);
		  } else {
			callback(stdout);
		  }          
		}); 
    }
    allFiles = testtools.getAllNonTestModuleRelativePathMapping();

    files = _.filter(allFiles, function (f) {return /(\/lib\/)|-min\.js/.test(f);});
    files.push(path.basename(outputFilepath));
	files = _.union(files, _.filter(allFiles, function (f) {return /generated/.test(f);}));    
    return files;
	
};

exports.runTests = function (callback, errback, dryRun) {
	var testtools = require("./kirin-testtools.js");
	var path = require("path");
	var plugins = testtools.getAllPlugins();
	var errors = [];
	_.each(plugins, function (plugin) {
		var pluginPath = plugin.prefix;
		pluginPath = pluginPath.replace(/src$/, "");
		var testAllJs = path.join(pluginPath, "test", "test-all.js");
		
		

		if (path.existsSync(testAllJs)) {
			// TODO can we use something bbetter than a raw require 
			// while still exposing testtools?
			if (!dryRun) {
				try {
					require(testAllJs);
				} catch (e) {
					console.error(require("util").inspect(e));
					errors.push(e);
				}
			} else {
				console.log("node " + testAllJs);
			}
		} else {
			console.error("# node " + testAllJs + " # doesn't exist");
		}
	});
	
	if (errors.length === 0) {
		callback();
	} else {
		errback(errors);
	}
};

function requireNativeBuildTools(platform) {
	try {
		return require("./kirin-buildtools-" + platform + ".js");
	} catch (e) {
		console.error("Native building is not supported on " + platform, e);
		process.exit(1);
	}
}

exports.compileNative = function (isApplication, dir, platform, buildType, environment, callback, errback) {
	var nativeBuilder = requireNativeBuildTools(platform);
	if (isApplication) {
		nativeBuilder.compileApplication(environment, dir, buildType, callback, errback);
	} else {
		nativeBuilder.compileDependency(environment, dir, callback, errback);
	}
};



exports.deriveBuildPath = function (platform, dir, environment) {
	var nativeBuilder = requireNativeBuildTools(platform);
	return nativeBuilder.deriveBuildPath(dir, environment);
};

exports.initializeProject = function (platform, environment, subProjects) {
	requireNativeBuildTools(platform).initializeProject(environment, subProjects);
};
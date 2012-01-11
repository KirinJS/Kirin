#!/usr/local/bin/node
"use strict";
var _ = require("underscore");
var util = require("util"), path = require("path");
var fs = require("fs");
var testTools = require("./building/kirin-testtools.js");
var buildtools = require("./building/kirin-buildtools.js");

var kirinPluginsPath = process.env["KIRIN_PLUGINS"];

var pathSep = ":";
if (process.platform === "windows") {
	pathSep = ";";
}

if (kirinPluginsPath) {
	kirinPluginsPath = kirinPluginsPath.split(pathSep);
} else {
	kirinPluginsPath = [];
}	
kirinPluginsPath.push(path.join(__dirname, "plugins"));

function buildAll (argv, dir) {
	var i, max;
	var run = "help";
	pluginModules = {};
	libraryModules = {};
	var defaults = {
		testing: "all",
		buildType: "developer",
		resourcesDir: "common/resources",
		javascriptSrcDir: "common/javascript/src",
		javascriptTestDir: "common/javascript/test",
		minifiedJs: "application.js",
		dirname: dir,
		jslint: true
	};

	var args = _.extend({dirname: dir}, defaults);
	
	ARGS: for (i=2, max=argv.length; i<max; i++) {
		switch (argv[i]) {
			case "-p":
			case "--platform":
				args.platform = argv[i+1];
				i++;
				break;
			case "-b":
			case "--build-type":
				args.buildType = argv[i+1];
				i++;
				break;
			case "-d":
			case "--build-dir":
				args.buildDir = argv[i+1];
				i++;
				break;
			case "--tests":
				args.testing = argv[i+1];
				i++;
				break;
			case "--minify":
				args.minify = true;
				break;
			case "--nolint":
				args.jslint = false;
			default:
				run = "help";
				break ARGS;
		}
	}
	
	var environment = args;
	
	if (!environment.testing) {
		switch (environment.buildType) {
			case "qa": 
			case "developer": 
			case "production":
			case "stage":
				environment.testing = "all";
				break;
			case "uitest":
				environment.testing = "none";
		}
	}
	
	switch (environment.testing) {
		case "none": 
			delete environment.testing;
			break;
		case "unit":
		case "integration":
			environment.testing = [environment.testing];
			break;
		case "all":
			environment.testing = ["unit", "integration"];
	}

	if (!environment.minify) {
		switch (environment.buildType) {
			case "qa":  
			case "production":
			case "stage":
				environment.minify = true;
				break;
			default:
				environment.minify = false;
		}
	}
	
	if (!environment.buildDir) {
		environment.minify = false;
	}
	

	if (!buildtools.isValidConfiguration(args.platform, args.buildType)) {
		help("Not a valid platform and/or buildtype");
	}
	
	
	var filters = buildtools.filters(args.platform, args.buildType);
	environment.excludeRegexp = new RegExp("-" + filters.negative.join("|-"));
	environment.includeRegexp = new RegExp("-" + filters.positive.join("|-"));
	environment.allVariantsRegexp = new RegExp("-" + filters.allVariants.join("|-"));

	preBuild(environment);
 
	buildModule(null, environment, dir);	

	postPluginProcessing(environment);
}

function startMessage (msg) {
	console.log("# ============================ " + msg);
}

function preBuild(env) {

	var dir = env.buildDir;
	if (dir) {
		startMessage("Preparing destination directory");
		if (path.existsSync(dir)) {
			rmForce(dir);
		}
		mkdirs(dir);
	}
}

function postPluginProcessing(environment) {
	
	if (environment.jslint) {
		startMessage("JSLint");
		if (!buildtools.runJSLint()) {
			endBuildBadly("Too many JSLint errors.");
		}
	}

	if (environment.testing) {
		startMessage("Tests");
		buildtools.runTests(function () {
			packaging(environment);
		}, 
		function () {
			endBuildBadly("Not all tests passed");
		});
	} else {
		packaging(environment);
	}
}

function packaging (environment) {
	if (environment.buildDir) {

		var jsFiles = testTools.getLibraryFiles();
		
		if (environment.minify) {
			jsFiles = buildtools.runCompiler(path.join(environment.buildDir, environment.minifiedJs), endBuild);
		} else {
			jsFiles = testTools.getAllNonTestModuleRelativePathMapping();
		}

	
		startMessage("Building index file");
		var indexBuilder;
		try {
			indexBuilder = require("./building/build-index-" + environment.platform + ".js");
		} catch (e) {
			indexBuilder = require("./building/build-index-webview.js");
			indexBuilder.templateFile = "index-" + environment.platform + ".html";
		}
		jsFiles = _.union(_.keys(libraryModules), jsFiles);
		indexBuilder.buildIndexFile(jsFiles, environment.buildDir); 
	}

	if (!environment.minify) {
		endBuild();
	} else {
		startMessage("Minifying");
	}	
	
}

function endBuildBadly (err) {
	console.error(err);
	process.exit(1);
}

function endBuild () {
	console.log("DONE");
	process.exit(0);	
}

function callCallback (callbacks, name, filepath) {
	var cb = callbacks[name];
	if (_.isFunction(cb)) {
		return cb(filepath);
	} else {
		return true;
	}
}

function dirWalker (filepath, callbacks) {
	if (!path.existsSync(filepath)) {
		return;
	}
	var info = fs.statSync(filepath);
	if (info.isDirectory()) {	
		if (callCallback(callbacks, "preTraversal", filepath)) {
			var files = fs.readdirSync(filepath);
			_.each(files, function (file) {
				dirWalker(path.join(filepath, file), callbacks);
			});
			callCallback(callbacks, "postTraversal", filepath);
		}
	} else if (callCallback(callbacks, "testFile", filepath)) {
		callCallback(callbacks, "perFile", filepath);
	}
}

function rmForce(dir) {
	console.log("rm -Rf " + dir);
	dirWalker(dir, {
		perFile: function (file) {
			fs.unlinkSync(file);
		},
		postTraversal: function (dir) {
			fs.rmdirSync(dir);
		}
	});
}

function mkdirs(dirname) {

	var path = require("path");
	
	if (path.existsSync(dirname)) {
		return true;
	} else {
		mkdirs(path.dirname(dirname));
		console.log("mkdir " + dirname);
		fs.mkdirSync(dirname);
		return true;
	}
}


function loadJSON(dir, file) {
	var myPath = path.join(dir, file);
	try {
		var string = fs.readFileSync(myPath);
		return JSON.parse(string.toString());
	} catch (e) {
		console.error("Problem parsing " + myPath, e);
	}
}

var pluginModules = {};
var libraryModules = {};
function buildModule (pluginName, inheritedEnvironment, dir) {

	var info = loadJSON(dir, "info.js");
	if (!info) {
		info = loadJSON(dir, "common/javascript/info.js");
	}
	
	if (!info) {
		
	}
	
	var environment = _.extend(info, inheritedEnvironment);
	
	pluginName = pluginName || info.name;

	pluginModules[pluginName] = {};
	buildDependencies(info, environment);
	startMessage("Gathering " + pluginName);
	var createFilteredWalker = function (extensionPattern, exclusionsPattern) {
		extensionPattern = extensionPattern || /\.*$/;
		exclusionsPattern = exclusionsPattern || /(\.git|\.svn)$/;

		var extensionFunction = extensionPattern;
		if (_.isRegExp(extensionPattern)) {
			extensionFunction = function (filepath) {
				return extensionPattern.test(filepath);
			};
		}
		
		return {
			preTraversal: function (dirpath) {
				return !exclusionsPattern.test(dirpath);
			},
			postTraversal: function (dirpath) {
							
			},
			testFile: function (filepath) {
				if (!extensionFunction(filepath)) {
					return true;
				}
				
				if (!environment.allVariantsRegexp.test(filepath)) {
					return true;
				}
				
				return environment.includeRegexp.test(filepath);
			}
			
		};
	};
	
	var createFileCopier = function (srcPath, destPath) {
		return function (filepath) {
			var newFilepath = filepath.replace(srcPath, destPath);
			mkdirs(path.dirname(newFilepath));
			console.log("cp " + filepath + " " + newFilepath);
			fs.linkSync(filepath, newFilepath);
		};
	}
	
	
	var javascriptFileWalker = createFilteredWalker(/\.js$/);

	
	var javascriptFiles = [];
	javascriptFileWalker.perFile = function (filepath) {
		javascriptFiles.push(filepath);
	};
	
	var srcPath = path.join(dir, info.src || "common/javascript/src");
	var resPath = path.join(dir, info.resources || "common/resources");	
	var libPath = path.join(dir, info.lib || "common/lib");	

	dirWalker(srcPath, javascriptFileWalker);


	var moduleInfo = testTools.addPlugin(pluginName, javascriptFiles, srcPath);	
	pluginModules[pluginName] = moduleInfo;

	
	
	if (environment.buildDir) {
		var resourceFileWalker = createFilteredWalker(/\.(sql|txt|json|css|properties|html)$/);

		resourceFileWalker.perFile = createFileCopier(resPath, path.join(environment.buildDir, "resources"));		
		dirWalker(resPath, resourceFileWalker);
		
		if (!environment.minify) {
			var copier = createFileCopier(srcPath, path.join(environment.buildDir, "src"));
			_.each(_.values(moduleInfo["default"]), copier);
		}
		
		var isMinified = /-min\.js$/;
		var isJs = /\.js$/;
		var libWalker = createFilteredWalker();
		libWalker.testFile = function (filepath) {
			if (environment.minify) {
				return isMinified.test(filepath);
			} else {
				return isJs.test(filepath) && !isMinified.test(filepath);
			}
		};
		libWalker.perFile = createFileCopier(libPath, path.join(environment.buildDir, "lib"));		
		dirWalker(libPath, libWalker);
		
		libWalker.perFile = function (filepath) {
			var filename = filepath.replace(libPath, "lib");
			libraryModules[filename] = 1;
		}
		dirWalker(libPath, libWalker);
		
		
	}
	

	

}

function buildDependencies(info, environment) {
	var dependencies = info.plugins || info.dependencies;
	if (_.isArray(dependencies)) {
		_.each(dependencies, function (m) {
			if (!pluginModules[m]) {
				buildDependency(m, environment);
			}
		});
	}

}

function buildDependency (moduleName, info) {
	var done = false;

	if (moduleName === "kirin-core") {
		buildModule(moduleName, info, path.join(__dirname, "core"));
		return;
	}

	var found = false;
	_.each(kirinPluginsPath, function (pluginsDir) {
		var pluginPath = path.join(pluginsDir, moduleName);
		if (path.existsSync(pluginPath)) {	
			found = true;
			buildModule(moduleName, info, pluginPath);
		}
	});
	
	if (!found) {
		console.error("Cannot resolve " + moduleName + " in any of the paths specified in KIRIN_PLUGINS.");
		process.exit(1);
	}
}


function help (err) {
	console.error("HELP: " + err);
	
	console.log(fs.readFileSync(path.join(__dirname, "./building/build-usage.txt")).toString());
	
	
	process.exit(1);
}


exports.build = buildAll;
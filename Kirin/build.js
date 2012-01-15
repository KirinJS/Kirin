#!/usr/local/bin/node
"use strict";
var _ = require("underscore");
var util = require("util"), path = require("path");
var fs = require("fs");
var testtools = require("./building/kirin-testtools.js");
var buildtools = require("./building/kirin-buildtools.js");

var kirinPluginsPath = process.env["KIRIN_PLUGINS"];
var dryRun = false;
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
		buildType: "dev",
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
				break;
			case "--native":
				args.compileNative = true;
				break;
			case "--ios-configuration":
				args["ios.configuration"] = argv[i+1];
				i++;
				break;
			case "--dry-run":
				args.dryRun = dryRun = true;
				break;
			case "-x":
			case "--app-file":
				args.appFile = argv[i+1];
				i++;
				break;
			default:
				run = "help";
				break ARGS;
		}
	}
	
	switch (args.buildType) {
		case "developer": 
			args.buildType = "dev";
			break;
		case "production": 
			args.buildType = "prod";
			break;			
	}
	
	var environment = args;
	
	if (!environment.testing) {
		switch (environment.buildType) {
			case "qa": 
			case "dev": 
			case "prod":
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
			case "prod":
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
	
	if (args.buildType === "none") {
		// noop build type.
		return;
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
	// the first module will always be the application?
	env.isApplication = true;
}

function postPluginProcessing(environment) {
	
	if (environment.jslint) {
		startMessage("JSLint");
		if (!buildtools.runJSLint(dryRun)) {
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
		}, dryRun);
	} else {
		packaging(environment);
	}
}

function packaging (environment) {
	var continuation = environment.compileNative ? compileNative : endBuild;
	if (environment.buildDir) {

		var jsFiles = testtools.getLibraryFiles();
		
		if (environment.minify) {
			jsFiles = buildtools.runCompiler(path.join(environment.buildDir, environment.minifiedJs), continuation, dryRun);
		} else {
			jsFiles = testtools.getAllNonTestModuleRelativePathMapping();
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
		if (!dryRun) {
			indexBuilder.buildIndexFile(jsFiles, environment.buildDir); 
		} else {
			console.log("# creating index file from Javascript files");
		}
		
		if (environment.minify) {
			startMessage("Minifying");
		}
	}

	if (!environment.minify) {
		continuation();
	}
	
}

function compileNative () {
	startMessage("Compiling native projects");

	var i = 0; 
	var env;
	var errback = endBuildBadly;
	var cb = function () {
		if (i < buildOrder.length) {
			env = buildOrder[i];

			//  (isApplication, dir, environment, callback, errback)
			i++;
			buildtools.compileNative(env.isApplication, env.cwd, env, cb, errback);
		} else {
			endBuild();
		}
	};
	
	cb();
	
}

function postPackaging (environment) {

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
	if (dryRun) {
		return;
	}
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
		if (!dryRun) {
			fs.mkdirSync(dirname);
		}
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
var buildOrder = [];
function buildModule (pluginName, inheritedEnvironment, dir) {

	var info = loadJSON(dir, "info.js");
	if (!info) {
		info = loadJSON(dir, "common/javascript/info.js");
	}
	
	if (!info) {
		throw new Error("Can't find an info.js in " + dir);
	}
	
	var environment = _.extend(info, inheritedEnvironment);
	
	pluginName = pluginName || info.name;

	pluginModules[pluginName] = {};
	
	var isApplication = environment.isApplication;
	environment.cwd = dir;
	
	
	
	delete environment.isApplication;
	buildDependencies(info, environment);
	environment.isApplication = isApplication;
	buildOrder.push(environment);
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
			if (!dryRun) {
				fs.linkSync(filepath, newFilepath);
			}
		};
	}
	
	
	var javascriptFileWalker = createFilteredWalker(/\.js$/);

	
	var javascriptFiles = [];
	javascriptFileWalker.perFile = function (filepath) {
		javascriptFiles.push(filepath);
	};
	
	var srcPath = path.join(dir, info["javascript.src"] || "common/javascript/src");
	var resPath = path.join(dir, info["common.resources"] || "common/resources");	
	var libPath = path.join(dir, info["javascript.lib"] || "common/lib");	

	dirWalker(srcPath, javascriptFileWalker);


	var moduleInfo = testtools.addPlugin(pluginName, javascriptFiles, srcPath);	
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
	if (err) {
		console.error("HELP: " + err);
	}
	console.log(fs.readFileSync(path.join(__dirname, "./building/build-usage.txt")).toString());
	
	
	process.exit(1);
}


exports.build = buildAll;
#!/usr/bin/env node
"use strict";
var _ = require("underscore"),
	util = require("util"), 
	path = require("path"),
	fs = require("fs");
	
var testtools = require("./building/kirin-testtools.js"),
	buildtools = require("./building/kirin-buildtools.js"),
	fileUtils = require("./building/fileUtils.js");

var kirinPluginsPath = process.env["KIRIN_PLUGINS"];
var dryRun = false;
var verbose = false;


var tempDirRoot;
var tempDir = null;
var pathSep;
if (process.platform === "windows") {
	pathSep = ";";
	tempDirRoot = process.env["TEMP"];
} else {
	pathSep = ":";
	tempDirRoot = process.env["TMPDIR"];
}

if (kirinPluginsPath) {
	kirinPluginsPath = kirinPluginsPath.split(pathSep);
} else {
	kirinPluginsPath = [];
}	
kirinPluginsPath.push(path.join(__dirname, "plugins"));

var initialArgs = {};

function buildAll (argv, dir) {
	var i, max;
	var run = "help";
	pluginModules = {};
	libraryModules = {};
	var defaults = {
		testing: "all",
		buildType: "dev",
		minifiedJs: "application.js",
		dirname: dir,
		jslint: true
	};

	var args = initialArgs = {};
	
	
	
	
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
			case "--ios": 
				args.platform = "ios";
				args.compileNative = true;
				break;
			case "--ios-configuration":
				args["ios.configuration"] = argv[i+1];
				i++;
				break;
			case "--initialize":
				args.projectInit = true;
				args.compileNative = false;
				args.noJSBuildDir = true;
				args.jslint = false;
				args.testing = [];
				break;
			case "--dry-run":
				args.dryRun = dryRun = true;
				break;
			case "-x":
			case "--app-file":
				args.appFile = argv[i+1];
				i++;
				break;
			case "-B":
			case "--no-js-build":
				args.noJSBuildDir = true;
				break;
			case "-v":
			case "--verbose":
				verbose = args.verbose = true;
				break;
			default:
				run = "help";
				break ARGS;
		}
	}
	
	fileUtils.setDryRun(args.dryRun);
	fileUtils.setVerbose(args.verbose);

	_.defaults(args, defaults);
	console.dir(args);
	
	if (args.noJSBuildDir) {
		delete args.buildDir;
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
	

	var info = loadInfo(dir);	
	if (environment.noJSBuildDir) {
		environment.minify = false;
		environment.jslint = false;
	} else if (!environment.buildDir) {

		environment.cwd = dir;

		environment.buildDir = buildtools.deriveBuildPath(environment.platform, dir, info);
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



	preBuild(info, environment);
 
	buildModule(null, environment, dir);	

	postPluginProcessing(environment);
}


function startMessage (msg) {
	if (dryRun || verbose) {
		console.log("# ============================ " + msg);
	}
}

function preBuild(info, env) {
	//if (env.buildDir) {
	//	tempDir = env.tempDir = fileUtils.mkdirTemp(tempDirRoot, info.name + "-", "-build");
	//}


	var dir = env.buildDir;
	if (dir) {
		env.tempDir = dir;
		startMessage("Preparing destination directory");
		if (path.existsSync(dir)) {
			fileUtils.rmForce(dir, dryRun);
		}
		fileUtils.mkdirs(dir, dryRun);
	}
	// the first module will always be the application?
	env.isApplication = true;
}

function postPluginProcessing(environment) {
	
	if (environment.projectInit) {
		buildtools.initializeProject(environment.platform, environment, buildOrder);
	}
	
	if (environment.jslint) {
		startMessage("JSLint");
		if (!buildtools.runJSLint(dryRun, verbose)) {
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
			// TODO wrap the js files with browserify templates
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
			if (verbose) {
				console.log("# creating index file from Javascript files");
			}
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
	
	// TODO make sure we can compile workspaces.
	
	var i = 0; 
	var env;
	var errback = endBuildBadly;
	var cb = function () {
		if (i < buildOrder.length) {
			env = buildOrder[i];

			//  (isApplication, dir, environment, callback, errback)
			if (env.isApplication) {
				env.info.appFile = env.appFile;
			}
			
			i++;

			var args = _.extend(_.clone(env.info), env.info);
			_.defaults(args, initialArgs);
			buildtools.compileNative(env.isApplication, env.cwd, env.platform, env.buildType, args, cb, errback);
		} else {
			endBuild();
		}
	};
	
	cb();
	
}

function postPackaging (environment) {

}

function endBuildBadly (err) {
	if (tempDir) {
		fileUtils.rmForce(tempDir);
	}
	console.error(err);
	process.exit(1);
}

function endBuild () {
	if (tempDir) {
		fileUtils.rmForce(tempDir);
	}
	console.log("DONE");
	process.exit(0);	
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

function loadInfo(dir) {
	var info = loadJSON(dir, "info.js");
	if (!info) {
		info = loadJSON(dir, "common/javascript/info.js");
	}
	
	if (!info) {
		throw new Error("Can't find a valid info.js in " + dir);
	}

	function mergeWithPrefix(prefix, src, dest) {
		_.each(src, function (i, key) {
			dest[prefix + key] = src[key];
		});
		return dest;
	}

	_.each(_.keys(info), function (key) {
		var value = info[key];
		if (typeof value === 'object' && !_.isArray(value)) {
			mergeWithPrefix(key + ".", value, info);
			delete info[key];
		}
	});
	return info;
}

var pluginModules = {};
var libraryModules = {};
var buildOrder = [];



function buildModule (pluginName, inheritedEnvironment, dir) {


	var info = loadInfo(dir);
	var environment = _.extend({}, info, inheritedEnvironment);
	environment.info = info;
	info.dryRun = dryRun;
	environment.cwd = dir;
	
	
	pluginName = pluginName || info.name;

	pluginModules[pluginName] = {};
	
	var isApplication = environment.isApplication;
	environment.cwd = dir;

	
	
	delete environment.isApplication;
	buildDependencies(info, environment);
	environment.isApplication = isApplication;
	buildOrder.push(environment);
	startMessage("Gathering " + pluginName);

	var javascriptFileWalker = fileUtils.walkDirectory.createFilteredWalker(/\.js$/);
	javascriptFileWalker.createSpecificFileTest(environment);
	
	var javascriptFiles = [];
	javascriptFileWalker.perFile = function (filepath) {
		javascriptFiles.push(filepath);
	};
	
	var srcPath = path.join(dir, info["javascript.src"] || "common/javascript/src");
	var resPath = path.join(dir, info["common.resources"] || "common/resources");	
	var libPath = path.join(dir, info["javascript.lib"] || "common/lib");	

	fileUtils.walkDirectory(srcPath, javascriptFileWalker);


	var moduleInfo = testtools.addPlugin(pluginName, javascriptFiles, srcPath);	
	pluginModules[pluginName] = moduleInfo;

	
	
	if (environment.buildDir) {
		var resourceFileWalker = fileUtils.walkDirectory.createFilteredWalker(
		        function (filepath) {
			            return ! /\.js/.test(filepath);
		        }
		);
		resourceFileWalker.createSpecificFileTest(environment);
		
		resourceFileWalker.perFile = fileUtils.walkDirectory.createFileCopier(resPath, path.join(environment.buildDir, "resources"));		
		fileUtils.walkDirectory(resPath, resourceFileWalker);
		resourceFileWalker.perFile = fileUtils.walkDirectory.createFileCopier(srcPath, path.join(environment.tempDir, "src"));		
	    fileUtils.walkDirectory(srcPath, resourceFileWalker);	
		
		if (!environment.minify) {
			// TODO wrap the js files with browserify templates
			var copier = fileUtils.walkDirectory.createFileCopier(srcPath, path.join(environment.tempDir, "src"));
			// do the copying here.
			var files = _.values(moduleInfo["default"]);
			_.each(files, copier);
			
			// we have a list of files that we'd like to 
			// a) if not minifying then we should copy to a directory, changing the name as we go, preserving the file paths. We should also add the browserify templates. client-modules should be a browserify template.
			// b) if minifying, we should copy a tmp directory, changing the name as we go, preserving the file paths. We should not add the browserify templates. 
			// c) if testing, we should preserve in place and change the way we call tests, and by replacing require.
			
		} else {
		    // we're only going to copy the generated javascript from src here.
			var copier = fileUtils.walkDirectory.createFileCopier(srcPath, path.join(environment.tempDir, "src"));
			var files = _.values(moduleInfo["default"]);
			var re = /generated/;
			files = _.filter(files, function (filename) { 
			    return re.test(filename);
			});
			console.dir(files);
			_.each(files, copier);
			
			
		}
		
		var isMinified = /-min\.js$/;
		var isJs = /\.js$/;
		var libWalker = fileUtils.walkDirectory.createFilteredWalker();
		libWalker.testFile = function (filepath) {
			if (environment.minify) {
				return isMinified.test(filepath);
			} else {
				return isJs.test(filepath) && !isMinified.test(filepath);
			}
		};
		libWalker.perFile = fileUtils.walkDirectory.createFileCopier(libPath, path.join(environment.buildDir, "lib"));		
		fileUtils.walkDirectory(libPath, libWalker);
		
		libWalker.perFile = function (filepath) {
			var filename = filepath.replace(libPath, "lib");
			libraryModules[filename] = 1;
		}
		fileUtils.walkDirectory(libPath, libWalker);
		
		
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
			return;
		}
		
		var infojs = path.join(pluginsDir, "info.js");
		if (path.existsSync(infojs)) {
			var newInfo = loadInfo(pluginsDir);
			if (newInfo.name === moduleName) {
				found = true;
				buildModule(moduleName, info, pluginsDir);
				return;
			}
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


if(require.main === module) {
	buildAll(process.argv, path.join(__dirname, "core"));
}
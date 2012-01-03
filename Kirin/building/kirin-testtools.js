
var _ = require("underscore");
var util = require("util"), 
	path = require("path");
var buildtools = require("./kirin-buildtools.js");
var realRequire = require;

// data structures used to gather all plugin paths together
// MODULE STATE
var pluginInfos = {};
var allNonTestModules = {};
var allNonTestModules_relative = {};

var nonTestFilesList = [];
var nonTestFilesList_relative = [];
var nonTestJavascript = [];
var nonTestJavascript_relative = [];
//

var knownKeywords = buildtools.allKeywords;


function ModulePath (moduleNameToPathMap, fallback) {
	this.exportObjects = {};
	this.dormantModules = typeof moduleNameToPathMap === 'object' ? moduleNameToPathMap : {};
	this.fallbackModules = fallback || {};
	this.requireFunction;
};

ModulePath.prototype.require = function (moduleName) {
	var exports = this.exportObjects[moduleName];
	if (!_.isUndefined(exports)) {
		return exports;
	}
	var moduleFunctions = this.dormantModules;
	var module = this.getModuleFilename(moduleName);
	if (_.isString(module)) {
		// if it's a string, real require it. 
		setupGlobalDefineModules(moduleFunctions);
		var modulePath = module;
		
		module = realRequire(modulePath);
		// if it was a defineModule, then 
		// dormant modules have been added to.

		var newModule = moduleFunctions[moduleName];
		if (_.isFunction(newModule)) {
			module = newModule;
		} else if (typeof module === 'object' && !_.isEmpty(module)) {
			// if it was really a vanilla module, then we'll be dealing 
			// with an exports object.
			this.exportObjects[moduleName] = module;
			return module;
		} else {
			// otherwise, I don't know what he have here: 
			// it has an empty exports object, and it hasn't defined a function.
			throw new Error("Module " + moduleName + " at " + modulePath + " is non-sensical");
		}
	}

	if (!this.requireFunction) {
		var that = this;
		this.requireFunction = function (moduleName) {
			that.require(moduleName);
		}
	}
	
	if (_.isFunction(module)) {
		exports = {};
		this.exportObjects[moduleName] = exports;
		module(this.requireFunction, exports);
		return exports;
	}
}

ModulePath.prototype.mergeWith = function (otherModulePath) {
	this.exportObjects = {};
	var i=0, max=arguments[i];
	for (i=0;i<max; i++) {
		_.extends(this.dormantModules, arguments[i]);
	}
}

ModulePath.prototype.addModule = function (moduleName, module) {
	this.dormantModules[moduleName] = module;
}

ModulePath.prototype.getModuleFilename = function (moduleName) {
	return this.dormantModules[moduleName] || this.fallbackModules[moduleName];
}

ModulePath.prototype.nodeRequire = realRequire;

ModulePath.prototype.toString = function () {
	var util = require("util")
	
	return util.inspect(this.fallbackModules);

};

function setupGlobalDefineModules (dormantModules) {
	var defineModule = function (name, moduleFunction) {
		dormantModules[name] = moduleFunction;
	}
	global.defineModule = defineModule;
	global.defineScreen = defineModule;
	global.defineUiFragment = defineModule;
	global.defineService = defineModule;
}

exports.createEmptyModulePath = function () {
	return new ModulePath({}, {});
};

function createStarModulePath (testType, pluginNames) {
	var dormantModules = [];
	_.each(pluginNames, function (pluginName) {
		var moduleInfo = pluginInfos[pluginName];
		var modulePaths = moduleInfo.modules[testType];
		if (modulePaths) {
			dormantModules = _.extend(dormantModules, modulePaths);
		}
	});
	return new ModulePath(dormantModules, allNonTestModules);
}

exports.createUnitTestingModulePath = function () {
	return createStarModulePath("dummy", _.toArray(arguments));;
};

exports.createIntegrationModulePath = function () {
	return createStarModulePath("integration", _.toArray(arguments));;
};

function count(string, substring) {
    return string.split(substring).length - 1;
}

exports.addPlugin = function (pluginName, modulePaths, longestPathPrefix) {

	var moduleInfo = {
		dummy: {},
		integration: {},
		fakeNative: {},
		"default": {}
	}
	

	var moduleNameSplitter = /[\.-]/;
	var modulePathSplitter = /[\/\\]/;
	
	_.each(modulePaths, function (filepath) {
		var parts = filepath.split(modulePathSplitter);

		var filename = parts[parts.length-1].replace(/\.[^.]*$/, "");
		parts = filename.split(moduleNameSplitter);
		var moduleName = parts.shift();
		var nonDefault = false;
		_.each(parts, function (moduleNamePart) {
			// sort the module name into the right testing bucket.
			var map = moduleInfo[moduleNamePart];
			if (map) {
				// TODO make sure we get a bit more specific about conflict resolution
				map[moduleName] = filepath;
				nonDefault = true;
			} else if (_.indexOf(knownKeywords, moduleNamePart) < 0) {
				moduleName += "-" + moduleNamePart;
			}
		});
		
		if (!nonDefault) {
			var existing = moduleInfo['default'][moduleName];
			var numHyphens = count(path.basename(filepath), "-");
			if (!existing || count(path.basename(existing), "-") < numHyphens) {
				moduleInfo['default'][moduleName] = filepath;
			}
			existing = allNonTestModules[moduleName];
			if (!existing || count(path.basename(existing), "-") < numHyphens) {
				allNonTestModules[moduleName] = filepath;
				allNonTestModules_relative[moduleName] = filepath.replace(longestPathPrefix, "src");
			}
		
		}
		
	});
	
	var client_modules = allNonTestModules["client-modules"];
	var client_modules_relative = allNonTestModules_relative["client-modules"];

	if (client_modules) {
		delete allNonTestModules["client-modules"];
		delete allNonTestModules_relative["client-modules"];
	}

	nonTestFilesList_relative = _.values(allNonTestModules_relative);
	nonTestFilesList = _.values(allNonTestModules);	
	
	if (client_modules) {
		nonTestFilesList.unshift(client_modules);
		nonTestFilesList_relative.unshift(client_modules_relative);
		
		allNonTestModules_relative["client-modules"] = client_modules_relative;
		allNonTestModules["client-modules"] = client_modules;
	}

	
	var isJs = function (f) {
		return /\.js$/.test(f);
	};
	
	nonTestJavascript = _.filter(nonTestFilesList, isJs);
	nonTestJavascript_relative = _.filter(nonTestFilesList_relative, isJs);
	
	pluginInfos[pluginName] = {
		prefix: longestPathPrefix,
		name: pluginName,
		modules: moduleInfo
	};
	
	return moduleInfo;
	
};

exports.getAllResourcesAndJavascript = function () {
	return nonTestFilesList;
};

exports.getAllNonTestModulePathMapping = function () {
	return nonTestJavascript; //allNonTestModules;
};

exports.getAllNonTestModuleRelativePathMapping = function () {
	return nonTestJavascript_relative; //allNonTestModules_relative;
};

exports.getLibraryFiles = function () {
	return [];
};

exports.getAllPlugins = function () {
	return pluginInfos;
};

exports.reset = function () {
	pluginInfos = {};

	allNonTestModules = {};
	allNonTestModules_relative = {};
}
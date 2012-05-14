/*
   Copyright 2011 Future Platforms

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

var Native = require("./Native"),
	slice = Array.prototype.slice,
	native2js = {},
	callbacks = {},
	gwtObjects = {}, 
	// XXX 'screens' is set by GWT-Exporter. 
	gwtClasses = Native.getGlobal().screens || {},
	_ = require("underscore"),
	myRequire = require;

/**********************************************************************/
/* Utility methods to help calling native from Javascript and vice versa.
 **********************************************************************/

/*
 * Make a wrap function which takes a "NativeObject" and some method names, and turns it into 
 * something we can call with a more JS-like syntax: 
 * e.g.
 * Native.exec("NativeObject.make_for_", "something", "me"); 
 * NativeObject.make_for_("something", "me");
 * should be functionally equivalent.
 */

var tokenGenerator = (function() {
	var counter = 0;
	return function (jsName, methodName) {
		var prefix = (arguments.length >= 2) ?
				jsName + methodName : "anon.";
        if (typeof prefix !== 'string'){
            prefix = "noname.";
		}
		return prefix + (counter ++);
	};
})();

var wrapCallback = function (callback, jsName, methodName) {
	if (typeof callback !== 'function') {
		return null;
	}
	var token = tokenGenerator(jsName, methodName);
	callbacks[token] = callback;
	return token;
};

var wrapCallbacks = function (config, moduleName) {
	if (typeof config !== 'object') {
		throw new Error("First argument of wrapCallbacks should be an object");
	}
	if (typeof moduleName !== 'string') {
		moduleName = "anonymousModule";
	}
	moduleName += ".";
	var key, value;
	for (key in config) {
		if (config.hasOwnProperty(key)) {
			value = config[key];
			if (typeof value === 'function') {
				config[key] = wrapCallback(value, moduleName, key);
			}
		}
	}
	return config;
};

var createWrappingCall = function (jsName, methodName) {
	return function () {
		var args = slice.call(arguments, 0);
		var i = 0, max;
		for (max=args.length; i<max; i++) {
			if (typeof args[i] === 'function') {
				args[i] = wrapCallback(args[i], jsName, methodName);
			}
		}
		args.unshift(jsName + "." + methodName);
		return Native.exec.apply(null, args);
	};
};

function createProxy (className, methodNames) {
	var proxy, i=0, max;
	if (!_.isArray(methodNames)) {
		proxy = methodNames; // methodNames is the object.
	} else {
		proxy = {};
		for (max=methodNames.length; i<max; i++) {
			var methodName = methodNames[i];	
			proxy[methodName] = createWrappingCall(className, methodName);
		}
	}
	return proxy;
}
	

function handleError(during, e) {
	
	
	/*
	 *    {
            "message": "Can't find variable: cardObject",
            "line": 505,
            "sourceId": 250182872,
            "sourceURL": "file:///Users/james/Library/Application%20Support/iPhone%20Simulator/4.3.2/Applications/ADE774FF-B033-46A2-9CBA-DD362196E1F7/Moo.app/generated-javascript//src/controller/CardController.js",
            "expressionBeginOffset": 22187,
            "expressionCaretOffset": 22197,
            "expressionEndOffset": 22197
        }
	 */
	console.error("-------------------------------------------------");
	console.error("Exception found " + during);
	console.error("Message: " + e.message);
	console.error("at     : " + e.line);
	var filename = e.sourceURL || "unknown";
	filename = filename.replace(/.*generated-javascript\//, "");
	console.error("file   : " + filename);
	console.error("url    : " + e.sourceURL);
	
	var stack = e.stack || e.stacktrace;

	if (stack) {
		console.error(stack);
	} else {
		console.log("No stack trace");
	}
}

function resolveModule(moduleName) {
	if (gwtClasses) {
		if (gwtObjects[moduleName]) {
			return gwtObjects[moduleName];
		} else if (gwtClasses[moduleName]) {
			gwtObjects[moduleName] = new gwtClasses[moduleName]();
			return gwtObjects[moduleName]; 
		}
	}
	try {
	    return myRequire(moduleName);
	} catch (e) {
	    // we don't need to do anymore, 
	    // as require will have reported the problem
	}
}
exports.resolveModule = native2js.resolveModule = resolveModule;


native2js.loadProxyForModule = function (moduleName, methodNames) {
	var proxy = createProxy(moduleName, methodNames);
	var module_;
	try {
	    module_ = resolveModule(moduleName);
	} catch (e) {
	    handleError("resolving module " + moduleName, e);
	    return;
	}
	if (module_) {
	    try {
	        module_.onLoad(proxy);
	    } catch (e1) {
	        handleError("loading module " + moduleName, e1);
	    }
	}
	
};

native2js.unloadProxyForModule = function (moduleName) {
	try {
		var module = resolveModule(moduleName);
		// TODO unrequire
		module.onUnload();	
	} catch (e) {
		handleError("unloading module", e);
	}
};

native2js.execMethod = function (moduleName, methodName, argsList) {
	var module = resolveModule(moduleName);

	if (!module) {
		console.error("No such module " + moduleName);
		return;
	}

	if (typeof module[methodName] !== 'function') {
		console.warn("Module " + moduleName + " does not have a method " + methodName);
		return;
	}
		
	try {
		if (argsList) {
			module[methodName].apply(module, argsList);
		} else {
			module[methodName]();
		}
	} catch (e) {
		handleError("executing " + moduleName + "." + methodName, e);
	}
};

native2js.execCallback = function (callbackId, argsList) {
	var callback = callbacks[callbackId];
	if (!callback) {
		console.warn("Callback " + callbackId + " doesn't exist");
		return;
	}
	if (typeof callback !== 'function') {
		console.error("Problem calling callback '" + callbackId + "'");
		return;
	}
	
	try {
		if (argsList) {
			callback.apply(null, argsList);		
		} else {
			callback();
		}
	} catch (e) {
		handleError("calling callback " + callbackId + JSON.stringify(argsList), e);
	}
};

/* Once a callback has been finished with, then it should 
 * be removed from the Javascript context.
 * 
 * It will be up to the caller to delete the callbacks when 
 * they've finished with them
 * (difference b/w callback and listener).
 */
native2js.deleteCallback = function (args) {
	var i=0, max;
	for (max=args.length; i<max; i++) {
		delete callbacks[args[i]];
	}
};

/**
 * Let native see all these functions.
 *
 */
Native.exposeToNative("native2js", native2js);

/**
 * As a convenience, let javascript see them too.
 * It may turn out we don't need any of these functions.
 */
exports.native2js = native2js;

/**********************************************************************/
/* Expose the proxies to Javascript.
 **********************************************************************/

exports.wrapCallback = wrapCallback;
exports.wrapCallbacks = wrapCallbacks;
	exports.exposeToNative = Native.exposeToNative;

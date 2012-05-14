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
	services = {};

/**********************************************************************/
/* Utility methods to help calling native from Javascript and vice versa.
 **********************************************************************/


/**
 * To be called by native.
 * From a classname and method names, a proxy is created which will 
 * call the native object.
 * This gives nice Javascipt-y calling syntax, instead of 
 * whatever mindfuck the actual bridge ends up being.
 * The proxy is *not* returned, but placed in the services object.
 *
 * The proxy will be available to Javascript via the proxy() method. 
 * 
 * 
 */
native2js.registerProxy = function (className, object) {
	services[className] = object;
};

native2js.registerScreenProxy = function (className, object) {
	native2js.registerProxy("NativeScreenObject", object);
};

/*
 * Make sure we can callback into javascript from native. 
 * We ask the native calls to check in their functions at the border, 
 * and this is a place to let them use those callbacks.
 */
native2js.callCallback = function (callback) {		
	var args = slice.call(arguments, 1);
	return callback.apply(null, args);
};


exports.native2js = native2js;

/**
 * Native tells Javascript that this is the screen we're on. 
 * Typically, the Native screen will call this method 
 * in the onResume() or viewWillAppear: method.
 * Native should use registerScreenProxy followed by setCurrentScreenProxy.
 */
native2js.setCurrentScreenProxy = function (className) {
	exports.js2nativeScreenProxy = services.NativeScreenObject;
	
	// having this happen with require makes unloading the className problematic (eventually)
	// TODO review memory usage.
	Native.exposeToNative("native2jsScreenProxy", require(className));
};

native2js.initializeApplicationLifecycle = function () {
	require("window").setTimeout(function () {
		var appLifecycle = require("ApplicationLifecycle");
		Native.exposeToNative("ApplicationLifecycle", appLifecycle);
		appLifecycle.onApplicationResume();
	}, 10);
};

Native.exposeToNative("native2js", native2js);
exports.exposeToNative = Native.exposeToNative;


/**********************************************************************/
/* Expose the proxies to Javascript. */
/**********************************************************************/
		
/**
 * For Javascript side to call. This is to let Javascript 
 * access native backend components.
 * Any call to registerProxy will dump things into the services object.
 * Currently, the only proxy is "NativeScreenObject", 
 * which is used for the communicating with the screen.
 * 
 */
exports.proxy = function (name) {
	var service = services[name];
	
	if (typeof service === 'undefined') {
		throw new Error("Native proxy is not available yet: " + name);
	}
	
	return service;
};

// for documentation purposes:
exports.js2nativeScreenProxy = null;

exports.wrapCallback = function (fn) {
	return fn;
};

exports.deleteCallback = native2js.deleteCallback;
native2js.deleteCallback = function () {
	// NOP
};

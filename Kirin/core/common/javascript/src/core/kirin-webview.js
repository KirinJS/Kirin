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

defineModule("kirin", function (require, exports) {
	var Native = require("Native"),
		slice = Array.prototype.slice,
		native2js = {},
		callbacks = {},
		services = {};
	
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
		var token = tokenGenerator(jsName, methodName);
		callbacks[token] = callback;
		return token;
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
	}
	
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
	 * @deprecated
	 */
	native2js.registerProxy = function (className, methodNames) {
		services[className] = createProxy(className, methodNames);
	};
	
	/* @deprecated */
	native2js.registerScreenProxy = function (className, methodNames) {
		native2js.registerProxy("NativeScreenObject", methodNames);
	};

	native2js.loadProxyForModule = function (moduleName, methodNames) {
		var proxy = createProxy(moduleName, methodNames);
	
		var module = require(moduleName);
		module.onLoad(proxy);
	};
	
	native2js.unloadProxyForModule = function (moduleName) {
		var module = require(moduleName);
		// TODO unrequire
		module.onUnload();	
	};
	
	native2js.execMethod = function (moduleName, methodName, argsList) {
		
		var module = require(moduleName);


		if (!module) {
			console.error("No such module " + moduleName);
			return;
		}

		if (typeof module[methodName] !== 'function') {
			console.error("Module " + moduleName + " does not have a method " + methodName);
			return;
		}
			
		try {
			if (argsList) {
				module[methodName].apply(null, argsList);
			} else {
				module[methodName]();
			}
		} catch (e) {
			console.error(e);
		}
	};
	
	native2js.execCallback = function (callbackId, argsList) {
		var callback = callbacks[callbackId];
		
		if (typeof callback !== 'function') {
			console.error("Problem calling callback '" + callbackId + "'");
			return;
		}
		
		if (argsList) {
			callback.apply(null, argsList);		
		} else {
			callback();
		}

	};
	
	/*
	 * Make sure we can callback into javascript from native. 
	 * We ask the native calls to check in their functions at the border, 
	 * and this is a place to let them use those callbacks.
	 * @deprecated
	 */
	native2js.callCallback = function (callbackId) {
		var callback = callbacks[callbackId];
		
		if (typeof callback !== 'function') {
			console.error("Problem calling callback '" + callbackId + "'");
			return;
		}
		
		var args = slice.call(arguments, 1);
		return callback.apply(null, args);
	};
	
	/* Once a callback has been finished with, then it should 
	 * be removed from the Javascript context.
	 * 
	 * It will be up to the caller to delete the callbacks when 
	 * they've finished with them
	 * (difference b/w callback and listener).
	 */
	native2js.deleteCallback = function () {
		var args = slice.call(arguments, 0), i=0, max;
		for (max=args.length; i<max; i++) {
			delete callbacks[args[i]];
		}
	};
	
	
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
		var appLifecycle = require("ApplicationLifecycle");
		Native.exposeToNative("ApplicationLifecycle", appLifecycle);
		appLifecycle.onApplicationResume();
	};
	
	native2js.require = function (className) {
		require(className);
	};
	
	Native.exposeToNative("native2js", native2js);
	
	exports.native2js = native2js;
	
	/**********************************************************************/
	/* Expose the proxies to Javascript.
	 **********************************************************************/
			
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
	
	exports.wrapCallback = wrapCallback;
	exports.exposeToNative = Native.exposeToNative;
	
	// for documentation purposes:
	exports.js2nativeScreenProxy = null;
});
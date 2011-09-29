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


(function () {
	var moduleName = "Native";
	var module = function (require, exports) {
		var sys = require("sys");
		var slice = Array.prototype.slice;

		var EXPOSED_TO_NATIVE = {};


		var lastCall = {};
		exports.lastCall = lastCall;

    var allCalls = [];
    exports.allCalls = allCalls;
		
		var exec = function (method) {
			var args = slice.call(arguments, 1);
			lastCall.args = args;
			lastCall.method = method;
			lastCall.callback = {called: false};
			
			allCalls.push(_.clone(lastCall));
			//sys.puts(method + sys.inspect(args));
		};
		exports.exec = exec;
	
		exports.exposeToNative = function (name, object) {
			EXPOSED_TO_NATIVE[name] = object;
		}
		
		exports.EXPOSED_TO_NATIVE = EXPOSED_TO_NATIVE;
		
		exports.exposedToNative = function () {
			return EXPOSED_TO_NATIVE;
		};
		
		exports.tearDown = function () {
			lastCall = {};
			exports.lastCall = lastCall;
			
			allCalls = [];
			exports.allCalls = allCalls;
			
			return exports;
		};
	}; // end of module
	
	
	if (typeof(modules) !== 'undefined') {
		// so we may be in a browser context, and want to delay construction until we're required.
		modules[moduleName] = module;
	} else {
		// otherwise do it. Now. 
		module(require, exports);
	}	
})();
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

var EXPOSED_TO_NATIVE = {
	js_java_bridge: {
		ready: true
	}
};

defineModule("Native", function (require, exports) {

	
	/**
	 * Execute a native command in a queued fashion, to ensure commands do not
	 * execute with any race conditions, and only run when the browser location event is ready to
	 * recieve them.
	 * @param command Command to be run in Native, e.g. "ClassName.method"
	 * @param [args] Zero or more arguments to pass to the method
	 * object paramters are passed as an array object [object1, object2] each object will be passed as JSON strings
	 */
	var exec = function() {
		var args = arguments;
		var parts = Array.prototype.slice.call(args, 1);
		JavaProxyObject.call(args[0], JSON.stringify(parts));		
	};
	exports.exec = exec;
		
	if (console) {
		console.dir = function (obj) {
			console.log(JSON.stringify(obj));
		};
	}
	
	exports.exposeToNative = function (name, object) {
		EXPOSED_TO_NATIVE[name] = object;
	};

});
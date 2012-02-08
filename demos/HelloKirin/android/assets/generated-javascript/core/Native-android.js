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
	/*
	 * First: make sure we can call native.
	 * We'll make commands go from Native.exec("NativeObject.make_for_", "something", "me");
	 * to JavaProxyObject.call("NativeObject.make_for_", "['something', 'me']");
	 * to NativeObject.make_for_("something", "me");
	 */
	var queue = {
		commands: [],
		timer: null
	};
	
	/**
	 * Internal function used to dispatch the request to Native.  It processes the
	 * command queue and executes the next command on the list.  Simple parameters are passed
	 * as arguments on the url.  JavaScript objects converted into a JSON string and passed as a
	 * query string argument of the url.  
	 * @private
	 */
	var run_command = function() {
		
		if (!EXPOSED_TO_NATIVE.js_java_bridge.ready) {
			return;
		}
			
		EXPOSED_TO_NATIVE.js_java_bridge.ready = false;
	
		var args = queue.commands.shift();
		if (queue.commands.length === 0) {
			window.clearInterval(queue.timer);
			queue.timer = null;
		}
	
		var parts = Array.prototype.slice.call(args, 1);
		JavaProxyObject.call(args[0], JSON.stringify(parts));		    
	};
	
	/**
	 * Execute a native command in a queued fashion, to ensure commands do not
	 * execute with any race conditions, and only run when the browser location event is ready to
	 * recieve them.
	 * @param command Command to be run in Native, e.g. "ClassName.method"
	 * @param [args] Zero or more arguments to pass to the method
	 * object paramters are passed as an array object [object1, object2] each object will be passed as JSON strings
	 */
	var exec = function() {
		queue.commands.push(arguments);
		if (queue.timer === null) {
			queue.timer = window.setInterval(run_command, 10);
		}
	};
	exports.exec = exec;
	
	exports.exposeToNative = function (name, object) {
		EXPOSED_TO_NATIVE[name] = object;
	};
	
	exports.exposeToNative("require", require);
});
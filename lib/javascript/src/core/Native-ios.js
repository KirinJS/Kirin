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
	js_ObjC_bridge: {
		ready: true
	}
};






/*
 * First: make sure we can call native.
 * We'll make commands go from Native.exec("NativeObject.make_for_", "something", "me");
 * to window.location = native://NativeObject.make_for_/?["something","me"]
 * to [[[NativeObject alloc] init] make:@"something" for:@"me"]; 
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

	if (!EXPOSED_TO_NATIVE.js_ObjC_bridge.ready) {
		return;
	}
	
	EXPOSED_TO_NATIVE.js_ObjC_bridge.ready = false;

	var args = queue.commands.shift();
	if (queue.commands.length === 0) {
		window.clearInterval(queue.timer);
		queue.timer = null;
	}

	var parts = Array.prototype.slice.call(args, 1);
	var url = "native://" + args[0] + "/?" + encodeURIComponent(JSON.stringify(parts));	
	//var url = "native://" + args[0] + "/?" + JSON.stringify(parts);	
	document.location = url;		    
	
};

/**
 * Execute a native command in a queued fashion, to ensure commands do not
 * execute with any race conditions, and only run when the browser location event is ready to
 * recieve them.
 * @param {String} command Command to be run in Native, e.g. "ClassName.method"
 * @param {String} [args] Zero or more arguments to pass to the method
 * object paramters are passed as an array object [object1, object2] each object will be passed as JSON strings
 */
var exec = function() {
	queue.commands.push(arguments);
	if (queue.timer === null) {
		queue.timer = window.setInterval(run_command, 10);
	}
};
exports.exec = exec;

// Override console.log here, but only if we're in a browser context.
// We should be a bit smarter about this, as android 2.0+ gives us 
// reasonable logging.

// we're going to be a little messy here, and rewrite 
var log = console.log;
// assume the presence of console and document.
console.log = function (message) {
	exec("DebugConsole.log_atLevel_", message, "INFO");
};
console.debug = function (message) {
	exec("DebugConsole.log_atLevel_", message, "DEBUG");
};
console.warn = function (message) {
	exec("DebugConsole.log_atLevel_", message, "WARN");
};
console.error = function (message) {
	exec("DebugConsole.log_atLevel_", message, "ERROR");
};
console.dir = function (obj) {
	console.log(JSON.stringify(obj));
};


exports.exposeToNative = function (name, object) {
	EXPOSED_TO_NATIVE[name] = object;
};	

exports.getGlobal = function () {
    try {
        return window;
    } catch (e) {
        return global;
    }
};

exports.getGlobal().EXPOSED_TO_NATIVE = EXPOSED_TO_NATIVE;
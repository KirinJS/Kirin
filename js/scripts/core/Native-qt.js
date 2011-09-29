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

var EXPOSED_TO_NATIVE = {};

defineModule("Native", function (require, exports) {
	
	var debug = false;
	
	var exposeToNative = function (name, object) {
		EXPOSED_TO_NATIVE[name] = object;
	};

	exposeToNative("fireEventIntoJS", function (js) {
		js = "EXPOSED_TO_NATIVE." + js;
		if (debug) {
			console.log(js);
		}
		eval(js);	// JSLint complaint.
	});
	
	exposeToNative("fireEventIntoJSSilent", function (js) {
        js = "EXPOSED_TO_NATIVE." + js;
        eval(js);   // JSLint complaint.
    });
	
	exports.exposeToNative = exposeToNative;
	
	exports.exposed = function (key) {
		return EXPOSED_TO_NATIVE[key];
	};
	
	//console.log = function() {};
	console.error = console.log;
	console.debug = console.log;
	console.warn = console.log;
});
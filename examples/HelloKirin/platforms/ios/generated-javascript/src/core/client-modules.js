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

// largely inspired, if not wholesale copied from http://wiki.commonjs.org/wiki/Modules/CompiledModules
//
// library.js
//

var modules = {};
var require = (function() {

	// memoized export objects
	var exportsObjects = {};

	// don't want outsider redefining "require" and don't want
	// to use arguments.callee so name the function here.
	var require = function(name) {
		if (exportsObjects.hasOwnProperty(name)) {
			return exportsObjects[name];
		}
		var exports = {};
		// memoize before executing module for cyclic dependencies
		exportsObjects[name] = exports;
		if (modules[name]) {
			//console.debug("require(" + name + ")");
			var returned = modules[name](require, exports);
			if (typeof returned !== 'undefined') {
				// return object will be used instead of the object. 
				// this is discouraged.
				exportsObjects[name] = returned;
				return returned;
			}
		} else {
			throw new Error("Module '" + name + "' has not been loaded (doesn't exist)");
		}
		return exports;
	};

	return require;
})();

var run = function(name) {
	require(name); // doesn't return exports
};

var defineModule = function (name, block) {
	modules[name] = block;
};

var defineScreenModule = defineModule,
	defineUiFragmentModule = defineModule,
	defineServiceModule = defineModule;




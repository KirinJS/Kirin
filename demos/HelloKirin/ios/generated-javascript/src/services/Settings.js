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

defineModule("Settings", function (require, exports) {
	var kirin = require("kirin"),
		keyValuePairs = null,
		deletedKeys = [], 
		initialized = false,
		backend;
	
	exports.onLoad = function (proxy) {
		backend = proxy;
		exports.initializeSettings();
	};
	
	exports.onUnload = function () {
		backend = null;
	};

	var makeKey = function (string) {
		return string.replace(/[\/:]/g, "_");
	};
	
	exports.commit = function () {
//		var backend = kirin.proxy("Settings-backend");
		backend.updateContents_withDeletes_(keyValuePairs, deletedKeys);
		if (deletedKeys.length > 0) {
			deletedKeys = [];
		}
	};
	
	/**
	 * Attempt to find a value from any of the keys passed.
	 * If no values are found for any of the keys, the function returns undefined.
	 */
	exports.get = function () {
		var key, value;
		
		//console.log("keyValuePairs properties: " + _.keys(keyValuePairs));
		
		for (var i=0, max=arguments.length; i<max; i++) {
			key = makeKey(arguments[i]);
			value = keyValuePairs['' + key];
			
			//console.log("keyValuePairs[" + key + "] = " + value);
			
			if (typeof value !== 'undefined') {
				return value;
			}
		}
		// return undefined.
	};
	
	exports.put = function (key, value) {
		keyValuePairs[makeKey(key)] = value;
	};
	
	exports.remove = function (key) {
		key = makeKey(key);
		deletedKeys.push(key);
		delete keyValuePairs[key];
	};
	
	var updateJS = function (newValues, callback) {
		keyValuePairs = _.clone(newValues);
		console.log("keyValuePairs: ");
		_.each(keyValuePairs, function (i, key) {
			console.log("\t" + key + ": " + keyValuePairs[key]);
		});
		if (deletedKeys.length > 0) {
			deletedKeys = [];
		}
		if (callback) {
			callback();
		}
	};
	
	
//	kirin.exposeToNative("initializeSettings", updateJS);
	
	var rollback = function (callback) {
		var token = kirin.wrapCallback(function (values) {
			updateJS(values, callback);
		});
//        var backend = kirin.proxy("Settings-backend");
		backend.requestPopulateJSWithCallback_(token);
	};

	exports.rollback = rollback;
	exports.initializeSettings = rollback;

});
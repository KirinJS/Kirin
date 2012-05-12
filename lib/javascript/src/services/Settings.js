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

defineServiceModule("Settings", function (require, exports) {
	var kirin = require("kirin"),
		keyValuePairs = null,
		deletedKeys = [], 
		initialized = false,
		backend;
	
	exports.onLoad = function (proxy) {
		backend = proxy;
	};
	
	exports.resetEnvironment = function () {
			
		try {
			require("Environment");
		} catch (e) {
			console.warn("No Environment.js module is loaded");
		}
			
	};
	
	exports.mergeOrOverwrite = function (newValues) {
		
		if (keyValuePairs === null) {
			console.log("Initializing settings");
			keyValuePairs = {};
		}
		_.extend(keyValuePairs, newValues);
	};
	
	exports.onUnload = function () {
		backend = null;
		keyValuePairs = {};
	};

	var makeKey = function (string) {
		return string.replace(/[\/:]/g, "_");
	};
	
	exports.commit = function () {
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
        if (value === null || typeof value === 'undefined') {
            console.warn("Removing null value for " + key);
            exports.remove(key);
        } else {
            keyValuePairs[makeKey(key)] = value;
        }
    };
	
	exports.remove = function (key) {
		key = makeKey(key);
		deletedKeys.push(key);
		delete keyValuePairs[key];
	};
	
	var updateJS = function (newValues, callback) {
		keyValuePairs = _.clone(newValues);
		if (deletedKeys.length > 0) {
			deletedKeys = [];
		}
		if (callback) {
			callback();
		}
	};
	
	var rollback = function (callback) {
		var token = kirin.wrapCallback(function (values) {
			updateJS(values, callback);
		});

		backend.requestPopulateJSWithCallback_(token);
	};

	exports.rollback = rollback;
	exports.initializeSettings = rollback;

});
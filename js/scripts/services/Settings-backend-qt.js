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

defineModule("Settings-backend", function (require, exports) {
	var kirin = require("kirin"),
		backend = {};
	
	backend.requestPopulateJSWithCallback_ = function (updateJSCallback) {
		var cppSettings = kirin.proxy("cppSettings");
		var keys = cppSettings.allKeys();
		var obj = {};
		for (var i=0, max=keys.length; i<max; i++) {
			obj[keys[i]] = cppSettings.get(keys[i]);
		}
		kirin.native2js.callCallback(updateJSCallback, obj);
		kirin.native2js.deleteCallback(updateJSCallback);
	};
	
	backend.updateContents_withDeletes_ = function (keyValuePairs, deletedKeys) {
		var cppSettings = kirin.proxy("cppSettings");
		for (var i=0, max=deletedKeys.length; i<max; i++) {
			cppSettings.remove(deletedKeys[i]);
		}
		for (var k in keyValuePairs) {
			if (keyValuePairs.hasOwnProperty(k)) {
				cppSettings.set(k, keyValuePairs[k]);
			}
		}
	};
	
	
	kirin.native2js.registerProxy("Settings-backend", backend);
});
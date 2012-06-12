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

var assert = require('assert'),
	sys = require("sys"), 
	kirin = require("kirin"),
	Native = require("Native").tearDown();


var methods = [
	"requestPopulateJSWithCallback_",
	"updateContents_withDeletes_",
	
];


kirin.native2js.registerProxy("Settings-backend", methods);
var proxy = kirin.proxy("Settings-backend");


var backingObject = {
	coincidentallyImprobable: 42
};
 
proxy.requestPopulateJSWithCallback_ = function (callback) {
	kirin.native2js.callCallback(callback, backingObject);
	kirin.native2js.deleteCallback(callback);
};

var settings = require("app-preferences");
settings.initializeSettings();

var lastCall = Native.lastCall;
assert.equal("undefined", typeof lastCall.method);

exports.testInitialization = function () {
	settings.initializeSettings();
	//assert.equal("Settings-backend.requestPopulateJSWithCallback_", lastCall.method);
	
	
	assert.equal(42, backingObject.coincidentallyImprobable);
	
	assert.equal(42, settings.get("coincidentallyImprobable"));
	delete backingObject.coincidentallyImprobable;
};

exports.testGet = function () {
	var complexObject = { nested: [] };
	
	settings.put("complexObject", complexObject);
	
	assert.strictEqual(complexObject, settings.get("complexObject"));
	
	// with default
	assert.strictEqual(complexObject, settings.get("notThere") || complexObject);
	
	settings.remove("complexObject");
	
	assert.strictEqual(42, settings.get("complexObject") || 42);
	
	settings.put("nullObject", null);
	assert.equal(42, settings.get("nullObject") || 42);
	
	settings.remove("nullObject");
	assert.equal(42, settings.get("nullObject") || 42);
};

exports.testPut = function () {
	assert.equal("undefined", typeof settings.get("putObject"));
	var complexObject = { nested: [] };
	settings.put("putObject", complexObject);
	assert.strictEqual(complexObject, settings.get("putObject"));
};

exports.testRemove = function () {
	backingObject.present = 42;
	settings.remove("present");
	assert.equal("undefined", typeof settings.get("present"));
	
	settings.commit();
	assert.equal("undefined", typeof settings.get("present"));

	
	
};

exports.testCommit = function () {
	Native.tearDown();
	assert.equal("undefined", typeof Native.lastCall.method);
	settings.commit();
	assert.equal("Settings-backend.updateContents_withDeletes_", Native.lastCall.method);
};




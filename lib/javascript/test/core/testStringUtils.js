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


var stringUtils = require("kirin-string-utils-alpha");
var assert = require("assert");

var f = stringUtils.messageFormat;
var t = stringUtils.trim;

exports.testFormat_withIndexes = function () {
	assert.strictEqual("foo zub", 		f("foo {0}", "zub"));
	assert.strictEqual("foo zub bar", 	f("foo {1} {0}", "bar", "zub"));
};

exports.testFormat_withIndexes_withErrors = function () {
	assert.strictEqual("foo {10}", 		f("foo {10}", "zub"));
	assert.strictEqual("foo zub {10}", 	f("foo {1} {10}", "bar", "zub"));
};

exports.testFormat_withKeys = function () {
	assert.strictEqual("Hello world", 			f("Hello {name}", {name:"world"}));
	assert.strictEqual("Goodbye cruel world", 	f("Goodbye {adjective} {name}", {name:"world", adjective:"cruel"}));
};

exports.testFormat_withKeys_withErrors = function () {
	assert.strictEqual("Hello {name}", 				f("Hello {name}", {}));
	assert.strictEqual("Goodbye {adjective} world", f("Goodbye {adjective} {name}", {name:"world"}));
};

exports.testFormat_withKeys_andIndexes = function () {
	// weird
	assert.strictEqual("Hello cruel world", 			f("Hello {1} {name}", {name: "world"}, "cruel"));
	
	// even weirder
	assert.strictEqual("Hello {\"name\":\"world\"} world", 	f("Hello {0} {name}", {name: "world"}, "cruel"));
};

exports.testFormat_withGenerator = function () {
	var count = 0;
	var counter = function () {
		return count++;
	};
	
	assert.strictEqual("numbers 0, 1, 2", f("numbers {0}, {0}, {0}", counter));
	
};

exports.testFormat_withFalsyValues = function () {
	assert.strictEqual("foo {0}", 		f("foo {0}"));
	assert.strictEqual("foo null", 	f("foo {0}", null));
	assert.strictEqual("foo 0", 	f("foo {0}", 0));
};

exports.testTrim_withNormalValues = function () {
	assert.strictEqual("foo", t("foo     "));
	assert.strictEqual("foo", t("  foo"));
	assert.strictEqual("foo", t(" foo     "));
	assert.strictEqual("", t("    "));
};

exports.testStringPaddding = function () {
	var p = stringUtils.padded;
	assert.strictEqual("01", p(1, "0", 2));
	assert.strictEqual("001", p(1, "0", 3));
	assert.strictEqual("001", p(1, "00", 3));
	assert.strictEqual("001", p(1, "000", 3));
};
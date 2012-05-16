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

var api = require("../utils/api");
var assert = require('assert');

var dummyFn = function () {};

exports.testNormalizeForType = function () {
	
	 //(obj, mandatory, optional, oneof, defaultProperty, type);
	
	// a function on its own translates to an object with a read function.
	var obj = api.__normalizeForType(dummyFn, [], [], [], {},'read', 'function');
	assert.strictEqual(dummyFn, obj.read);
	
	assert.throws(function () { 
		// has a read, but no write.
		obj = api.__normalizeForType(dummyFn, ['read', 'write'], [], [], {}, 'read', 'function');
	});
	
	// write defaults to an empty method.
	obj = api.__normalizeForType(dummyFn, ['read'], [], ['write'], {}, 'read', 'function');
	assert.equal('function', typeof obj.write);
	
	assert.throws(function () {
		// should have at least a read or a write
		obj = api.__normalizeForType(dummyFn, [], [], ['missingMethod'], {}, 'undocumented', 'function');
	});

	assert.throws(function () {
		// should have at least a read or a write
		obj = api.__normalizeForType(dummyFn, [], [], ['read', 'write'], {}, 'undocumented', 'function');
	});
	
	// should return an object which started as a string, but changed to {url: "google.com"}.
	obj = api.__normalizeForType("google.com", ['url'], [], [], {}, 'url', 'string');
	assert.equal("google.com", obj.url);
	
	
	obj = {};
	api.__normalizeForType(obj, [], ["url", "method"], [], {"url": "slashdot.org", "method": "GET"}, null, 'string');
	assert.equal("slashdot.org", obj.url);
	assert.equal("GET", obj.method);
	
};

exports.testNormalizeWithConfig = function () {
	
	// testing ordering of config, not the __normalizeForType.
	
	assert.equal(typeof "foo", "string");
	
	var config = {
		'function': {
			defaultProperty: 'read',
			mandatory: ['read'],
			oneOf: ['write']
		},
	
		'string': {
			oneOf: ['extension']
		},
	};
	
	var obj = {'read': dummyFn, 'extension': 'xml' };
	
	var obj = api.normalizeAPI(config, obj);
	assert.strictEqual(dummyFn, obj.read);
	
	config = {
			'string': {
				defaultProperty: 'value'
			},
			
			'function': {
				oneOf: ['toString']
			}
	};
	obj = api.normalizeAPI(config, "foo");
	assert.equal("foo", obj.value);
	
	// fail because of a missing function (second type).
	assert.throws(function() {
		config.function.oneOf = ["definitelyMissingMethod"];
		obj = api.normalizeAPI(config, "foo");
	});

	config = {
		string: {
			defaultProperty: 'url',
			mandatory: ["url"],
			defaults: {
				"method": "GET"
			}
		},
		number: {
			defaults: {
				"version": 1.1
			}
		}
	};
	
	obj = api.normalizeAPI(config, "http://slashdot.org");
	assert.equal("http://slashdot.org", obj.url);
	assert.equal("GET", obj.method);
	assert.equal(1.1, obj.version);
			
	
};

exports.testNormalizeWithConfig_OptionalFunctionsAreProvidedAsNOOP = function() {
	var config = {
		'string': {
            optional: ['method']
        },
		
		'function': {
            optional: ['foo']
        }
	};
	
	var obj = api.normalizeAPI(config, {});
	
	// Optional strings should be left untouched.
	assert.strictEqual('undefined', typeof obj.method);
	
	// Optional functions should be created with a simple noop function
	assert.strictEqual('function', typeof obj.foo);
};

exports.testNormalizeWithConfig_defaultsWithoutOptional = function() {
	// Tests the simple case of one defaulted config parameter. 
	
	var config = {
		'string': {
            defaults: {'method': 'GET'}
        }
	};
	
	var obj = api.normalizeAPI(config, {});
	assert.strictEqual('GET', obj.method);
};

exports.testNormalizeWithConfig_defaultsWithOptional_SameName = function() {
	var config = {
		'string': {
            defaults: {'method': 'GET'},
			optional: ['method']
        }
	};
	
	var obj = api.normalizeAPI(config, {});
	assert.strictEqual('GET', obj.method);
	
	obj = api.normalizeAPI(config, { method: 'POST' });
	assert.strictEqual('POST', obj.method);
};

exports.testNormalizeWithConfig_BUG_defaultsWithOptional_were_undefined = function(){
	// Capturing this bug.
	// It was noticed that the "defaults" are left undefined if there is an 
	// "optional", regardless of whether the "optional" was present or not. 
	
	var config = {
		'string': {
            defaults: {'method': 'GET'},
			optional: ['fnordFitzherbert'] 
        }
	};
	
	var obj = api.normalizeAPI(config, {});
	assert.strictEqual('GET', obj.method);
	assert.strictEqual('undefined', typeof obj.fnordFitzherbert);
	
	obj = api.normalizeAPI(config, { method: 'POST' });
	assert.strictEqual('POST', obj.method);
	assert.strictEqual('undefined', typeof obj.fnordFitzherbert);
	
	obj = api.normalizeAPI(config, { fnordFitzherbert: 'III' });
	assert.strictEqual('GET', obj.method);
	assert.strictEqual('III', obj.fnordFitzherbert);
};

exports.testNormalizeWithConfig_BUG_optional_keys_were_added_as_undefined = function() {
	// Capturing this bug
	// A config with "optional" keys would have those optional keys added 
	// even if they were not present. The values for those new keys would then be undefined.
	// Desired behaviour is for optional keys (of types other than "function") to be left alone.  
	var config = {
		'string': {
			optional: ['fnordFitzherbert'] 
        }
	};
	
	var obj = api.normalizeAPI(config, {});
	assert.strictEqual(false, obj.hasOwnProperty('fnordFitzherbert'));
};

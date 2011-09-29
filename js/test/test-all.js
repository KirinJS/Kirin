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


var testThese = ['testKirinFFICore', "testSettings", "test-api-utils", "testNetworking", "testDatabases", "testStringUtils", "testJSONUtils"];



// =======================================



// Initialize some paths.


// the tests
require.paths.unshift(__dirname + "/core");
require.paths.unshift(__dirname + "/services");


// the test environment and dummies
require.paths.unshift(__dirname + "/test-environment");
require.paths.unshift(__dirname + "/dummies");

// the production code.
var codeUnderTestDir = __dirname + "/../scripts"
require.paths.unshift(__dirname + "/../lib");
require.paths.unshift(codeUnderTestDir + "/core");
require.paths.unshift(codeUnderTestDir + "/core/util");
require.paths.unshift(codeUnderTestDir + "/services");
require.paths.unshift(codeUnderTestDir + "/shared");
require.paths.unshift(codeUnderTestDir + "/shared/controllers");
require.paths.unshift(codeUnderTestDir + "/shared/screens");
require.paths.unshift(codeUnderTestDir + "/shared/models");

require("defineModule");

//Underscore is used throughout.
global._ = require("underscore");
global.sys = require("sys");

// Initialize test backends
require("Settings-backend");
//require("Environment");

require("Databases-backend");
require("Networking-backend");

var testRunner = require('test-runner');
testRunner.runSuite(testThese);


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

var sys = require('util');


function runSuite(testThese) {
	sys.puts("================================");
	var numFailures = 0;
	for (var i=0; i<testThese.length; i++) {
		var tests = require(testThese[i]);
		numFailures += runTestCase(testThese[i], tests);
		sys.puts("--------------------------------");
	}
	sys.puts("Out of " + testThese.length + " test cases, " + numFailures + " tests failed.");
	sys.puts("================================");
	if (numFailures !== 0) {
		process.exit(1);
	}
}

function runTestCase(testName, tests) {
	sys.puts("Testing  " + testName);
	
	var setupMethod = tests.setup;
	var numTests = 0;
	var numFailures = 0;
	var numSucceed = 0;
	for (var name in tests) {
		if (/^test/.exec(name)) {
			try {
				numTests ++;
				if (typeof setupMethod === 'function') {
					setupMethod();
				}	
				if (typeof tests[name] === 'function') {
					tests[name]();
				}
				numSucceed++;
			} catch (err) {
				numFailures ++;
				sys.debug("FAILED: " + name);
				if (typeof err.stack !== 'undefined') {
					sys.debug(err.stack);
				} else {
					sys.debug(sys.inspect(err));
				}	
			}
		}
		
	}
	
	sys.puts("Finished " + testName + ": passed " + numSucceed + "/" + numTests + " (" +(100 * numSucceed / numTests)+ "%)");
	return numFailures;
}

exports.runSuite = runSuite;

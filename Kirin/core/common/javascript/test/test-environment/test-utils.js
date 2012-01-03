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

// This module exports helpful utilities for use in test scripts.
var assert = require('assert');
var window = require('window');
var Native = require('Native');

/**
 * Simply counts the number of keys in the passed object, making sure 
 * they are actually on that object and not inherited from anything else.
 * It will count any object in the moduleExports argument, functions included. 
 */
var countExports = function(moduleExports) {
  var numExports = 0
  for(key in moduleExports) {
    if(moduleExports.hasOwnProperty(key)) numExports++;
  }
  return numExports;
}

/**
 * Ensures that there is exactly expectedNumExports number of objects/functions 
 * in the exportedObj. This can be used as a rudimetary guard against untested 
 * additions to JS code. 
 */ 
exports.assertNumExports = function(expectedNumExports, exportedObj) {
  assert.strictEqual(expectedNumExports, countExports(exportedObj));
}

/**
 * Sifts through all of the calls made to the NativeScreenObject 
 * searching for a particular method name and returns an array of all 
 * those calls.
 * 
 * @param methodName This is the method name to search for. Only calls to this 
 * method will be returned.
 */ 
exports.getCallsToNative = function(methodName) {
  return _.select(Native.allCalls, function(aNativeCall) {
    return aNativeCall.method === "NativeScreenObject." + methodName ;
  });
}

/**
 * This checks that any timeouts or intervals that were set are also cleared.
 * @param codeToTest A function that calls the code which uses the timeouts.
 */ 
exports.assertTimeoutsCleanup = function(codeToTest) {
  assert.strictEqual("function", typeof codeToTest);

  var intervalIds = []; // To keep track of all the setInterval IDs.
  
  var recordIntervalId = function(winFnArgs, intervalId) { intervalIds.push(intervalId); }
  var strikeOffIntervalId = function(winFnArgs) { intervalIds = _.without(winFnArgs[1]); }
  
  window.testSetListener('setInterval', recordIntervalId);
  window.testSetListener('setTimeout', recordIntervalId);
  
  window.testSetListener('clearInterval', strikeOffIntervalId);
  window.testSetListener('clearTimeout', strikeOffIntervalId);
  
  // Call the code in question..
  codeToTest();
  
  // Check that code did cleanup any timeouts that it used.
  assert.strictEqual(0, intervalIds.length);
}

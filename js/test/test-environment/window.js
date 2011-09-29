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

/**
 * Contains the typical functions you might see in a web browser's window/global 
 * object. These are for the test environment so they won't actually do anything 
 * unless the unit tests listen to calls to these functions and act upon them.
 * 
 * Use the exported testSetListener function to listen to calls to any of the 
 * window functions.
 */
defineModule("window", function (require, exports) {
  var _ = require("underscore");

  // Used to keep track of the callbacks registered via testSetListener()
  // Contains key (window object's function name) to object value (the callback 
  // function to call when the window object's function is called).
  var callbackFuncs = {}; 

  // Contains the scheduled timeouts ordered by time (first element is next 
  // one that will be called).
  // Each element is an object like:
  // {
  //   timeoutId: INT
  //   timeoutTime: INT
  //   interval: INT (if >0 then it is scheduled again whenever it is called back)
  //   callback: FUNCTION 
  // }
  var timeoutQueue = [];

  var timeoutIDCounter = 0;

  // This is used when passing the time. 
  // We figure out which intervals/timeouts to call from this.
  var currentTime = 0;

  /**
   * Clean everything up ready for a completely fresh unit test.  
   * Clears up any set listeners (set via the testSetListener() function).
   * Clears all intervals and timeouts.     
   */  
  exports.testReset = function() {
    callbackFuncs = {};
    timeoutQueue = [];
    timeoutIDCounter = 0;
    currentTime = 0;
  }

  /**
   * Simulates the passing of time. This will call any relevant 
   * timeouts/intervals that were scheduled to run within that time.
   */     
  exports.testPassTime = function(timeInMillis) {
    currentTime += timeInMillis;
    
    while(timeoutQueue.length > 0) {
      if(timeoutQueue[0].timeoutTime > currentTime) {
        return;
      }
      
      var nextTimeoutObj = timeoutQueue.shift();
      
      if(nextTimeoutObj.interval > 0) { 
        nextTimeoutObj.timeoutTime += nextTimeoutObj.interval;
        scheduleTimeout(nextTimeoutObj);
      }
      
      nextTimeoutObj.callback();
    }
  }

  /**
   * Call this function in your tests to be notified whenever one of the 
   * window/global functions (e.g. setInterval, clearTimeout, etc.) are called.
   * 
   * @param windowFnName A string, the name of the function that you want to monitor calls on.
   *  
   * @param callback This is a function that's called back whenever the windowFnName is called.    
   * 
   * The listener will be passed 2 arguments:
   *    
   * The first argument will be an array of the listenee function's arguments.
   *    
   * The second argument will be whatever was returned by the stubbed fucntion. 
   * This will be the dummy timeoutID for the setTimeout and setInterval functions.
   * This should be irrelevant for the clearTimeout and clearInterval functions.   
   */
  exports.testSetListener = function(windowFnName, callback) {
    callbackFuncs[windowFnName] = callback;
  } 
  
  var tellListener = function(windowFnName, timeoutId) {
    var callbackFn = callbackFuncs[windowFnName];
    
    if(_.isFunction(callbackFn)) {
      callbackFn(arguments, timeoutIDCounter);
    }
  };
  
  // Adds another timeout callback to the timeoutQueue .
  var scheduleTimeout = function(timeoutObj) {
    timeoutQueue.push(timeoutObj);
    
    // Keep it sorted by time
    timeoutQueue.sort(function(a, b) {
      if(a.timeoutTime < b.timeoutTime) { 
        return -1; 
      } else if(a.timeoutTime > b.timeoutTime) {
        return 1;
      }  
      return 0;
    });
  }
  
  // Removes the timeout object in the scheduled queue which has the given timeout ID
  var unscheduleTimeout = function(timeoutId) {
    for(i = 0; i < timeoutQueue.length; i++) {
      if(timeoutId === timeoutQueue[i].timeoutId) {
        timeoutQueue.splice(i, 1);
        return;
      }
    }
  }
  
  // Schedules a new (possibly repeating) timeout to be called some time in 
  // the future and returns a new timeoutID for it.
  var createTimeout = function(timeoutCallback, timeoutTime, isInterval) {
    timeoutIDCounter += 1;
     
    scheduleTimeout({
      timeoutId: timeoutIDCounter, 
      timeoutTime: currentTime + timeoutTime,
      interval: isInterval ? timeoutTime : 0,
      callback: timeoutCallback
    });
    
    return timeoutIDCounter;
  }
  
  exports.setTimeout = function(timeoutCallback, timeoutTime) {
    var timeoutId = createTimeout(timeoutCallback, timeoutTime, false);
     
    tellListener('setTimeout', timeoutId);
    
    return timeoutId;
  }
  
  exports.setInterval = function(timeoutCallback, timeoutTime) {
    var timeoutId = createTimeout(timeoutCallback, timeoutTime, true);
     
    tellListener('setInterval', timeoutId);
    
    return timeoutId;
  }
    
  exports.clearTimeout = function(timeoutId) {
    unscheduleTimeout(timeoutId);
    tellListener('clearTimeout', timeoutId);
  }

  exports.clearInterval = function(timeoutId) {
    unscheduleTimeout(timeoutId);
    tellListener('clearInterval', timeoutId);    
  }
});
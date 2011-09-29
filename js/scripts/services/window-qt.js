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

defineModule("window", function (require, exports) {
	var intervals = {};
	var timeouts = {};

	var timerQML = Qt.createComponent("MyTimer.qml");
	
	var timeoutIDs = 0;
	var intervalIDs = 0;
	
	var createTimer = function(interval) {
		var newTimer = timerQML.createObject(null);
		newTimer.timer.interval = interval;
		return newTimer;
	};
	
	var clear = function(list, id) {
		if (list[id]) {
			list[id].timer.stop();
			list[id].destroy();
			delete list[id];
		} else {
			console.log("WARNING: Overeager clearing of '" + id + "' timer");
		}
	};
	
	exports.setTimeout = function(timeoutFn, timeoutMillis) {
		var timerID = timeoutIDs++;
		var newTimer = createTimer(timeoutMillis);
		newTimer.timer.repeat = false;
		newTimer.timer.triggered.connect(function() {
			clear(timeouts, timerID);
			timeoutFn();
		});

		timeouts[timerID] = newTimer;
		timeouts[timerID].timer.start();
		return timerID;
	};
	
	exports.clearTimeout = function(timeoutID) {
		clear(timeouts, timeoutID);
	};
	
	exports.setInterval = function(intervalFn, intervalMillis) {
		var intervalID = intervalIDs++;
		var newTimer = createTimer(intervalMillis);
		newTimer.timer.repeat = true;
		newTimer.timer.triggered.connect(function() {
			intervalFn();
		});
		intervals[intervalID] = newTimer;
		intervals[intervalID].timer.start();
		return intervalID;
	};
	
	exports.clearInterval = function(intervalID) {
		clear(intervals, intervalID);
	};
});

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

defineModule("LocalNotifications", function (require, exports) {
	
	var api = require("api-utils"),
		kirin = require("kirin");
	
	exports.scheduleNotifications = function (notification1, notification2) {
		var notifications = Array.prototype.slice.call(arguments, 0);
		for (var i=0, max=notifications.length; i<max; i++) {
			notifications[i] = api.normalizeAPI({
				'string': {
					mandatory: ['title', 'body'],
					defaults:  {'icon':'icon'},
					optional: ['displayTimestring']
				},
				
				'number': {
					mandatory: ['id', 'timeMillisSince1970'],
					// the number of ms after which we start prioritising more recent things above you.
					defaults: {'epsilon': 1000 * 60 * 24 * 365},
					optional: ['displayTimestamp']
				},
				
				'boolean': {
					defaults: {
							'vibrate': false,
							'sound': false
					}
				}
				
			}, notifications[i]);
			notifications[i].displayTimestamp = notifications[i].displayTimestamp || notifications[i].timeMillisSince1970; 
		}

		kirin.proxy("LocalNotifications-backend").scheduleNotifications_(notifications);
	};
	
	exports.cancelNotifications = function (id1, id2, id3) {
		var ids = Array.prototype.slice.call(arguments, 0);
		for (var i=ids.length-1; i>=0; i--) {
			if (!_.isNumber(ids[i])) {
				throw new Error("Notification '" + ids[i] + "'  must be numeric, it's actually " + typeof(ids[i]) + "!");
			}
		}
		kirin.proxy("LocalNotifications-backend").cancelNotifications_(ids);
	};
	
	
});
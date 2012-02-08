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
 * Naive implementation to deliver local notifications/alarm events to a running application. 
 * 
 * Long term, this should be replaced with Organizer API http://doc.qt.nokia.com/qtmobility-1.1.0/organizer.html . 
 * e.g. QOrganizerItemVisualReminder
 */
defineModule("LocalNotifications-backend", function (require, exports) {
	
	var servicesDB = require("PlatformServicesDatabase");
	
	var pollForNotifications = function () {
		var dates = require("dates"),
			now = dates.getCurrentTime(),
			timeMs = now.getTime();
		
		console.log("Checking for local notifications");
		
		servicesDB.runQuery(function (db) {
			
			var events = [];
			
			db.transaction(function (tx) {
				
				tx.execStatementWithJsonReturn("SELECT n.* " +
						"FROM  localNotifications n " +
						"WHERE n.time < ?" +
						"  AND ? < (n.time + n.epsilon) " +
						"  ORDER BY n.time ASC", [timeMs, timeMs], 
					function (eventsArray) {
						events = eventsArray;
					});
				tx.execStatement("DELETE FROM localNotifications WHERE time < ?", [timeMs]);
				
			}, null, 
			function onSuccess () {
				
				if (!_.isEmpty(events)) {
					_.each(events, function (event) {
						console.log("Notification: " + event.body);
					});
					
					var appDelegate = require("kirin").proxy("NativeAppDelegate");
					if (_.isFunction(appDelegate.deliverNotifications)) {
						appDelegate.deliverNotifications(events);
					}
				}
			});
		});
	};
	
	var init = function () {
		var	window = require("window");
		
		window.setInterval(pollForNotifications, 60 * 1000);
		window.setTimeout(pollForNotifications, 1 * 500);
	};
	
	init();
	
	var backend = {};
	
	backend.cancelNotifications_ = function (ids) {
		servicesDB.runQuery(function (db) {
			db.transaction(function (tx) {
				tx.execStatement("DELETE FROM localNotifications WHERE id IN (" + ids.join(", ") + ")");
			});			
		});
	};
	
	backend.scheduleNotifications_ = function (notifications) {
		servicesDB.runQuery(function (db) {
			db.transaction(function (tx) {
				_.each(notifications, function (n) {
					
					if (n.displayTimestring) {
						n.title += " at " + n.displayTimestring;
					}
					
					tx.execStatement("INSERT OR IGNORE INTO localNotifications (id, body, time) VALUES (?, ?, ?)", [n.id, n.body, n.timeMillisSince1970]);
					tx.execStatement("UPDATE localNotifications SET " +
							"title=?, body=?, time=?, epsilon=?, vibrate=?, sound=? " +
							"WHERE id=?", 
							[n.title, n.body, n.timeMillisSince1970, n.epsilon, n.vibrate, n.sound, n.id]);
				});
			});
		});
	};
	
	require("kirin").native2js.registerProxy("LocalNotifications-backend", backend);
	
	
});
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

/***********************************************************************
 * Construct the code maps object from the baked in data and/or 
 * the database
 ***********************************************************************/
defineModule("PlatformServicesDatabase", function (require, exports) {
	var mDB = null;
	
	exports.closeDatabase = function () {
		mDB = null;
	};

	exports.runQuery = function (callback, errback) {
		if (mDB) {
			// XXX this should be some place else
			callback(mDB);
			return mDB;
		}
		var databases = require("Databases");
		mDB = databases.openDatabase({
			filename: "platformServices.db", 
			version: 2, 
			onCreate: function (tx) {
				tx.execSqlFile("/services/resources/create_db_services-qt.sql", function (e) {
					console.log("Notification database started");
				});
			},
			
			onUpdate: function (tx, oldVersion, newVersion) {
				
			},
	
			onError: function (err) {
				console.log("Problem opening the database: " + err);
				if (errback) {
					errback(err);
				}
			},
			
			onOpened: function (db) {
				console.log("Database opened: " + db);
				
				callback(db);
				mDB = db;
			}
		});
	};

	
});
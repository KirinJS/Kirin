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
 * Reduces the dependency on the current time, so we can unit test things. In
 * particular, so we can unit test different current times.
 * 
 * It may also be useful to put other common date manipulation code in here.
 */
defineModule("dates", function(require, exports) {
	
	exports.debuggingDate = null;
	
	/**
	 * Gets the current time.
	 */
	exports.getCurrentTime = function() {
		// months are zero indexed.
		// Sat 25th June, 02:15am. ie. Friday. 
		//return new Date(2011, 5, 25, 2, 15, 0); 
		// Sat 25th June, 12:15pm. ie. Saturday. 
		//return new Date(2011, 5, 25, 12, 15, 0); 
		// Fri 24th June, 12:15pm. ie. Friday. 
		//return new Date(2011, 5, 24, 12, 15, 0);
		if (exports.debuggingDate) {
			return exports.debuggingDate;
		}
		return new Date();
	};

	exports.getSQLDateTimeString = function(ddMMyy, hhmm) {
		var str = "";
		var dd, MM, yyyy, hh, mm, ss;
		if (ddMMyy) {
			var parts = ddMMyy.split("/", 3);
			if (parts.length === 3) {
				dd = parts[0]; 
				MM = parts[1]; 
				yyyy = parts[2]; 
			} else {
				ddMMyy = null;
			}
		} 
		
		if (!ddMMyy) {
			var date = exports.getCurrentTime();
			dd = date.getDate();
			MM = date.getMonth();
			yyyy = date.getYear();
		}
		
		if (hhmm) {
			hhmm += ":00";
			var parts2 = hhmm.split(":", 3);
			if (parts2.length === 3) {
				hh = parts2[0];
				mm = parts2[1];
				ss = parts2[2];
			} else {
				hhmm = null;
			}
		}
		if (!hhmm) {
			hh = "00";
			mm = "00";
			ss = "00";
		}

		return yyyy + "-" + MM + "-" + dd + " " + hh + ":" + mm + ":" + ss;
	};

	var regexpSql = /(\d{4})-(\d{1,2})-(\d{1,2})\s+(\d{1,2}):(\d{1,2}):(\d{1,2})/;
	var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	
	exports.sqlToDisplayString = function (sqlString) {
		
		if (!sqlString) {
			return "";
		}
		
		var m = sqlString.match(regexpSql);
		if (!m) {
			return "";
		}
		var monthIndex = parseInt(m[2], 10) - 1;
		return m[3] + " " + months[monthIndex] + " " + m[1];
	};
	
});

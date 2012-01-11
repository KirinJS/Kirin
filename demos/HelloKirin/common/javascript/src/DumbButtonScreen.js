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

defineModule("DumbButtonScreen", function (require, exports) {
	var strings = ["smallest", "still small", "small", "medium", "big", "bigger", "huge", "giant", "quite big", "biggest"],
		counter = strings.length - 1,
		theScreen;
	
	
	exports.onLoad = function (ui) {
		theScreen = ui;
	};
	
	exports.onResume = function () {
		console.log("We're running");
	};
	
	exports.onDumbButtonClick = function () {
		if (counter >= (strings.length - 1)) {
			counter = 0;
		} else {
			counter ++;
		}
	
		theScreen.updateLabelSize_andText_(counter * 5 + 10, strings[counter]);
	
		return true;
	};
		
	exports.onNextScreenButtonClick = function () {
		theScreen.changeScreen_(strings[counter]);
	};
});

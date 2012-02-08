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

defineScreenModule("DumbListScreen", function (require, exports) {

	var theScreen;

	var data = [
				{key: 'ant'}, {key: 'ball'}, {key: 'chair'}, 
				{key: 'dragon'}, {key: 'elf'}, {key: 'frog'}, 
				{key: 'gate'}, {key: 'helicopter'}, {key: 'igloo'},
				{key: 'jumper'}, {key: 'kite'}, {key: 'lady'}, 
				{key: 'man'}, {key: 'nest'}, {key: 'octopus'}, 
				{key: 'panda'}, {key: 'queen'}, {key: 'rabbit'}, 
				{key: 'shumper'}, {key: 'teacup'}, {key: 'umbrella'}, 
				{key: 'vase'}, {key: 'xylophone'}, {key: 'yoyo'}, 
				{key: 'zebra'}
			];

	exports.onLoad = function (ui) {
		theScreen = ui;
	};

	exports.onUnload = function () {
		theScreen = null;
	};

	exports.onResume = function () {
		theScreen.populateList_(data);	
	};
			
	exports.onListItemClick = function (index) {
		var key = data[index].key;
		console.log("Clicked on '" + key + "' (item #" + index + ")");
		theScreen.showToast_(key.toUpperCase());
	};	
});

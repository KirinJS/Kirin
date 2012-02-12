defineModule("MyScreen", function (require, exports) {

	var theScreen;
	
	exports.onLoad = function (ui) {
		theScreen = ui;
	};
	
	exports.onUnload = function () {
		theScreen = null;
	};
	
	exports.onResume = function () {
		var settings = require("Settings");
		
		theScreen.updateUiWithDictionary_({
			urlToDownload: settings.get("get.url")
		});
	};
	
	exports.onPause = function () {
	
	};
	
	exports.startDownload = function (url) {
		var controller = require("MyController");

		
		console.log("About to download " + url);
		
		controller.startDownload(url);
		
	};

});
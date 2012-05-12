defineModule("MyScreen", function (require, exports) {

	var theScreen;
	var controller = require("MyController");
	var imageList = [];
	
	var timers = require("Timers");
	var timer = null;
	
	exports.onLoad = function (ui) {
		theScreen = ui;
	};
	
	exports.onUnload = function () {
		theScreen = null;
	};
	
	function setImage (filePath) {
		if (theScreen) {
			theScreen.changeImage_(filePath);
		}
	}
	
	function cycleImages (list) {
		imageList = list;
		console.log("Cycling images");
		if (timer !== null) {
			return;
		}
		console.log("For the first time");
		if (imageList.length > 0) {
			setImage(imageList[0]);
		}
		var index = 0;
		timer = timers.setInterval(function () {
			if (imageList.length === 0) {
				return;
			}
			index = (index + 1) % imageList.length;
			setImage(imageList[index]);
		}, 1000);
	}
	
	exports.onResume = function () {
		var settings = require("Settings");
		
		theScreen.updateUiWithDictionary_({
			urlToDownload: settings.get("get.url")
		});
		
		controller.setImageListener(cycleImages);
		
		
	};
	
	
	
	exports.onPause = function () {
		controller.setImageListener(null);
	};
	
	exports.startDownload = function (url) {
		console.log("About to download " + url);
		
		controller.startDownload(url);
		
	};

});
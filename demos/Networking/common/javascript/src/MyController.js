defineModule("MyController", function (require, exports) {
	
	var net = require("Networking");
	
	var backgroundListenerId = "my-background-listener";
	var backgroundImageListenerId = "my-background-image-listener";
	
	// this isn't a usual lifecycle method, but we will call it from 
	// the app delegates onResume method.
	exports.onResume = function () {
		net.registerBackgroundListener(backgroundListenerId, function (context, responseString) {
			var json = JSON.parse(responseString);
			if (json.patterns) {
				exports.downloadImages(context.imageDirectory, json.patterns);
			}
		});
		
		net.registerBackgroundListener(backgroundImageListenerId, function (context, filePath) {
			console.log(filePath);
		});
	};
	
	exports.onPause = function () {
	
	};
	
	exports.startDownload = function (url) {
		net.sendReliably({
			url: url,
			method: "GET",
			listenerId: backgroundListenerId,
			context: {"imageDirectory": "images"}
		});
	};
	
	exports.downloadImages = function (dir, list) {
		_.each(list, function (obj) {
			if (!obj.url) {
				return;
			}	
			net.sendReliably({
				listenerId: backgroundImageListenerId,
				url: obj.url,
				fileArea: "external",
				filename: dir + "/" + obj.id,
				binary: true,
				overwrite: false
			});		
		});
	};

	
});
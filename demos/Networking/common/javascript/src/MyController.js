defineModule("MyController", function (require, exports) {
	
	var net = require("Networking");
	var fs = require("FileSystem");
	var backgroundListenerId = "my-background-listener";
	var backgroundImageListenerId = "my-background-image-listener";
	
	var imageDirectory = "images";
	var allImageFiles = [];
	
	var imageListener = null;
	
	// this isn't a usual lifecycle method, but we will call it from 
	// the app delegates onResume method.
	exports.onResume = function () {
		console.log("MyController.onResume()");
		fs.listDir({
			fileArea: "external",
			filename: imageDirectory,
			
			callback: function (files) {

				allImageFiles = _.pluck(
					_.filter(files, function (obj) {
						return obj.filename !== ".DS_Store";
					}), "filePath");
				console.log("At startup, can display: " + allImageFiles.length);
				if (imageListener) {
					imageListener(allImageFiles);
				}				
			}
		});
	
		net.registerBackgroundListener(backgroundListenerId, function (context, responseString) {
			var json = JSON.parse(responseString);
			var photoObjects = require("JSONUtils").findArray(json, ["photos", "photo"]);
			if (photoObjects) {
				exports.downloadImages(imageDirectory, photoObjects);
			} else {
				console.error("Cannot find a list of image objects!");
			}
		});
		
		net.registerBackgroundListener(backgroundImageListenerId, function (context, filePath) {
			console.log(filePath);
			if (!_.contains(allImageFiles, filePath)) {
				allImageFiles.push(filePath);
			}
			
			if (imageListener) {
				imageListener(allImageFiles);
			}
		});
	};
	
	exports.onPause = function () {
		imageListener = null;
	};
	
	exports.startDownload = function (url) {
		allImageFiles = [];
		if (imageListener) {
			imageListener(allImageFiles);
		}
		
		net.cancelAllRequests(backgroundListenerId);
		
		var go = function () {		
			net.sendReliably({
				url: url,
				method: "GET",
				listenerId: backgroundListenerId,
				context: {timestamp: Date.now()}
			});
		};	
		
		fs.remove({
			filename: imageDirectory,
			fileArea: "external",
			callback: go,
			errback: go
		});
	

	};
	
	exports.downloadImages = function (dir, list) {
		console.dir(list);
		_.each(list, function (obj) {
			if (!obj.url_l) {
				return;
			}	
			console.log("Requesting " + obj.url_l);
			net.sendReliably({
				listenerId: backgroundImageListenerId,
				url: obj.url_l,
				fileArea: "external",
				filename: dir + "/" + obj.id,
				binary: true,
				overwrite: false,
				context: obj
			});		
		});
	};
	
	exports.setImageListener = function (callback) {
		imageListener = callback;
	};
	
});
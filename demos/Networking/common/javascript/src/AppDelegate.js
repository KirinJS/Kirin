defineModule("AppDelegate", function (require, exports) {
	var appDelegate = null;
	
	
	
	
	exports.onLoad = function (nativeObject) {
		appDelegate = nativeObject;
		
	};
	
	exports.onResume = function () {
		// this is where we should initialize any background listeners.
		
		require("MyController").onResume();
		
	};
	
	exports.onPause = function () {
		// this is where we should stop networking.
		require("MyController").onPause();	
	};

});
defineModule("Environment", function (require, exports) {
	
	var settings = require("Settings");
	
	var hostname = "http://fp-json.appspot.com/api/";
	settings.put("get.url", hostname + "goldfinger/patterns");
});
defineModule("Environment", function (require, exports) {
	
	var settings = require("Settings");
	
	var hostname = "http://fp-json.appspot.com/api/";

	
	var api_key = "bd03e0e88ae826e8ac66fc0053b3d5f6";
	var secret = "98e667b06e8a63ef";
	
	settings.put("get.url", "http://api.flickr.com/services/rest/?method=flickr.photos.search&api_key="+
							api_key+"&sort=interestingness-desc&extras=url_l&format=json&nojsoncallback=1&text=");
	settings.put("query", "");

});
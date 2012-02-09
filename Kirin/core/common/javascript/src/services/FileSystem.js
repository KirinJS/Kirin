defineModule("FileSystem", function (require, exports) {

	var backend;
	var wrapCallback;
	exports.onLoad = function (nativeObj) {
		backend = nativeObj;
		wrapCallback = require("kirin").wrapCallback;
	};
	
	exports.onUnload = function () {
		backend = null;
	};
	
	/*
	- (void) readStringWithConfig: (NSDictionary*) config;

- (void) readJsonWithConfig: (NSDictionary*) config;

- (void) copyItemWithConfig: (NSDictionary*) config;

- (void) deleteItemWithConfig: (NSDictionary*) config; 	
	*/
	
	exports.readString = function (fileArea, filename, callback, errback) {
		if (arguments.length < 3) {
			throw new Error("There has to be at least a fileArea, filename and callback for readString");
		}
		backend.readStringWithConfig_({
			fileArea: fileArea, 
			filename: filename, 
			callback: wrapCallback(
				function (list) { 
					callback(list.join("\n")); 
				}, "FileSystem", ".readStringCb."),
			errback: wrapCallback(errback, "FileSystem", ".readStringErr.")
		});
	};

	
	exports.readJson = function (fileArea, filename, callback, errback) {
		if (arguments.length < 3) {
			throw new Error("There has to be at least a fileArea, filename and callback for readJson");
		}
		backend.readJsonWithConfig_({
			fileArea: fileArea, 
			filename: filename, 
			callback: wrapCallback(callback, "FileSytem", "readJsonCb."),
			errback: wrapCallback(errback, "FileSytem", "readJsonErr.")
		});	
	};
	
	/**
	 * This is a like for like (file-to-file or dir-to-dir) copy.
	 * 
	 * This differs in behaviour to bash. 
	 * This is allowed: 
	 *    fs.copy("external", "file1", "external", "dir/file2")
	 * which is equivalent to: 
	 *    mkdir -p ~/dir
	 *    cp ~/file1 ~/dir/file2
	 * 
	 * But this: 
	 *    fs.copy("external", "file1", "external", "dir")
	 * is not equivalent to 
	 *    mkdir -p ~/dir
	 *    cp ~/file1 ~/dir
	 * 
	 */
	exports.copy = function (fromFileArea, fromFilename, toFileArea, toFilename, callback, errback) {
		if (arguments.length < 4) {
			throw new Error("There has to be at least a fromFileArea, fromFilename, toFileArea, toFilename for copy");
		}	
	 // - (void) copyItemWithConfig: (NSDictionary*) config;
	 	backend.copyItemWithConfig_({
	 		fromFileArea: fromFileArea, 
	 		fromFilename: fromFilename,
	 		
	 		toFileArea: toFileArea, 
	 		toFilename: toFilename,
	 		
	 		callback: wrapCallback(callback, "FileSytem", "copyCb."),
			errback: wrapCallback(errback, "FileSytem", "copyErr.")
	 	});
	};

});
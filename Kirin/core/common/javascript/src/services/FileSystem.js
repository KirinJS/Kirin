defineModule("FileSystem", function (require, exports) {

	var backend;
	var wrapCallbacks;
	exports.onLoad = function (nativeObj) {
		backend = nativeObj;
		wrapCallbacks = require("kirin").wrapCallbacks;
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

		backend.readStringWithConfig_(wrapCallbacks({
			fileArea: fileArea, 
			filename: filename, 
			callback: function (list) { 
					callback(list.join("\n")); 
			},
			errback: errback
		}, "FileSystem"));
	};

    exports.writeString = function (config) {
        var api = require("api-utils");
        
        api.normalizeAPI({
            string: {
                mandatory: ['contents'],
                oneOf: ['fileArea', 'filename', 'filePath']
            },
            'function': {
                optional: ['callback', 'errback']
            }
        }, config);
        wrapCallbacks(config, "FileSystem");

        
        console.log("About to save contents to file");
        backend.writeStringWithConfig_(config);        
    };
	
	exports.readJson = function (fileArea, filename, callback, errback) {
		if (arguments.length < 3) {
			throw new Error("There has to be at least a fileArea, filename and callback for readJson");
		}
		backend.readJsonWithConfig_(wrapCallbacks({
			fileArea: fileArea, 
			filename: filename, 
			callback: callback,
			errback: errback
		}, "FileSytem"));	
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
	 	backend.copyItemWithConfig_(wrapCallbacks({
	 		fromFileArea: fromFileArea, 
	 		fromFilename: fromFilename,
	 		
	 		toFileArea: toFileArea, 
	 		toFilename: toFilename,
	 		
	 		callback: callback,
			errback: errback
			
	 	}, "FileSytem"));
	};

    exports.listDir = function (config) {
        var api = require("api-utils");
        
        api.normalizeAPI({
            'function': {
                mandatory: ['callback'],
                optional: ['errback']
            },
            string: {
                oneOf: ['fileArea', 'filename', 'filePath']
            }
        }, config);
        
        backend.fileListFromConfig_(wrapCallbacks(config, "FileSystem"));
    };

});
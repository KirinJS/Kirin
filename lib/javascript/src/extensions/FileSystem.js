
var backend;
var wrapCallbacks;
exports.onLoad = function (nativeObj) {
    backend = nativeObj;
    wrapCallbacks = require("kirin").wrapCallbacks;
};

exports.onUnload = function () {
    backend = null;
};

function normalizeAPI(config) {
    var api = require("../utils/api-utils");
    
    api.normalizeAPI({
        string: {
            oneOf: ['fileArea', 'filename', 'filePath']
        },
        'function': {
            optional: ['callback', 'errback']
        }
    }, config);
    return config;
}

/*
    - (void) readStringWithConfig: (NSDictionary*) config;

- (void) readJsonWithConfig: (NSDictionary*) config;

- (void) copyItemWithConfig: (NSDictionary*) config;

- (void) deleteItemWithConfig: (NSDictionary*) config;     
    */

exports.readString = function (fileArea, filename, callback, errback) {
    var config;
    if (typeof fileArea === 'string') {
        if (arguments.length < 3) {
            throw new Error("There has to be at least a fileArea, filename and callback for readString");
        }
        config = {
            fileArea: fileArea, 
            filename: filename, 
            callback: function (string) { 
                    callback(decodeURIComponent(string)); 
            },
            errback: errback
        };
    } else {
        config = fileArea;
    }
    normalizeAPI(config);    
    backend.readStringWithConfig_(wrapCallbacks(config, "FileSystem.readString"));
};

exports.writeString = function (config) {
    require("../utils/api-utils").normalizeAPI({
        string: {
            mandatory: ['contents'],
            oneOf: ['fileArea', 'filename', 'filePath']
        },
        'function': {
            optional: ['callback', 'errback']
        }
    }, config);
    wrapCallbacks(config, "FileSystem.writeString");

    backend.writeStringWithConfig_(config);        
};

exports.readJson = function (fileArea, filename, callback, errback) {
    var config;    
    if (typeof fileArea === 'string') {
        if (arguments.length < 3) {
            throw new Error("There has to be at least a fileArea, filename and callback for readJson");
        }
        config = {
            fileArea: fileArea, 
            filename: filename, 
            callback: callback,
            errback: errback
        };
    } else {
        config = fileArea;
    }
    normalizeAPI(config);

    backend.readJsonWithConfig_(wrapCallbacks(config, "FileSytem.readJson"));    
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
    var config;
    if (_.isString(fromFileArea)) {
        if (arguments.length < 4) {
            throw new Error("There has to be at least a fromFileArea, fromFilename, toFileArea, toFilename for copy");
        }
        
        config = {
            fromFileArea: fromFileArea, 
            fromFilename: fromFilename,
         
            toFileArea: toFileArea, 
            toFilename: toFilename,
         
            callback: callback,
            errback: errback
        };
    
    } else {
    
        config = fromFileArea;
    }
    
    require("../utils/api-utils").normalizeAPI({
        'string': {
            oneof: ['fromFileArea', 'fromFilePath', 'fromFilename', 'toFileArea', 'toFilename', 'toFilePath']
        },
        'function': {
            optional: ['callback', 'errback']
        }
    
    
    }, config);
    
     backend.copyItemWithConfig_(wrapCallbacks(config, "FileSytem.copy"));
};

exports.listDir = function (config) {
    normalizeAPI(config);
    backend.fileListFromConfig_(wrapCallbacks(config, "FileSystem.listDir"));
};

exports.remove = function (config) {
    normalizeAPI(config);
    backend.deleteItemWithConfig_(wrapCallbacks(config, "FileSystem.remove"));
};


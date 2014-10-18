
var backend;
exports.onLoad = function (nativeObject) {
    backend = nativeObject;
};

exports.onUnload = function () {
    backend = null;
};

exports.transformSize = function (config) {
    var api = require("../utils/api-utils");
    api.normalizeAPI({
        "function": {
            mandatory: ['callback'],
            optional: ['errback']
        },
        
        'string': {
            oneof: ['fromFileArea', 'fromFilename', 'fromFilepath', 
                    'toFileArea', 'toFilename', 'toFilepath' ]
        },
        
        'number': {
            mandatory: ['height', 'width']
        },
        
        'boolean': {
            defaults: {
                overwrite: true
            }
        }
        
    }, config);        
    config.fileType = require("../utils/ImageUtils").getFileTypeFromExtension(config.toFilePath || config.toFilename);
    require('kirin').wrapCallbacks(config, "Camera.transformSize");
    
    backend.transform_withConfig_("size", config);
};



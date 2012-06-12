
var mNative, _;

exports.onLoad = function (nativeObject) {
	mNative = nativeObject;
    _ = require("underscore");
};



function prepareConfig(config) {
    var api = require("../utils/api-utils");
    api.normalizeAPI({    
        'function': {
            mandatory: ['onSuccess'],
            optional: ['onError', 'onCancel']
        },
        'number': {
                optional: ['targetWidth', 'targetHeight']
        },
        'string': {
            // if no filename is specified then we should 
            // hand back a dropbox key
            optional: ['filename']
        }
    }, config);
    config = _.clone(config);
    
    // TODO add mediaType
    var kirin = require('kirin');
    config = kirin.wrapCallbacks(config, "Camera");
    
	config.fileType = require("../utils/ImageUtils").getFileTypeFromExtension(config.filePath || config.filename);
	
    return config;
}

exports.takePicture = function (config) {
    mNative.cameraPicture_(prepareConfig(config));
};

exports.galleryPicture = function (config) {
	mNative.galleryPicture_(prepareConfig(config));
};

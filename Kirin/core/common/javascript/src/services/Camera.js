defineModule("Camera", function (require, exports) {

	var mNative;
	exports.onLoad = function (nativeObject) {
		mNative = nativeObject;
		console.log("Camera object loaded: ");
		console.dir(_.keys(nativeObject));
	};
	

	
	function prepareConfig(config) {
	    var api = require("api-utils");
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
        _.each(['onSuccess', 'onError', 'onCancel'], function (key) {
        	if (config[key]) {
        		config[key] = kirin.wrapCallback(config[key], "camera.", key);
        	}
        });
        
		config.fileType = require("ImageUtils").getFileTypeFromExtension(config.filePath || config.filename);
		
        return config;
	}
	
	exports.takePicture = function (config) {
        mNative.cameraPicture_(prepareConfig(config));
	};
	
	exports.galleryPicture = function (config) {
		mNative.galleryPicture_(prepareConfig(config));
	};


});
/*
   Copyright 2011 Future Platforms

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

defineServiceModule("Networking", function (require, exports) {

	var backend;

	var api, 
		kirin;
	
	exports.onLoad = function (nativeObject) {
		backend = nativeObject;
		
		api = require("api-utils");
		kirin = require("kirin");
	};

	exports.onUnload = function () {
		backend = null;
		
		api = null;
		kirin = null;
	};


    var wrapCallbacks = function (config) {
        var key;
        for (var i=1, max=arguments.length; i<max; i++) {
            key = arguments[i];
            config[key] = kirin.wrapCallback(config[key], "networking.", key);
        }
    };
    
	// Simply adds a key=value parameter on to the query string of the URL.
	// Anchors are left intact.
	// If there is no ? query string, one is appended to the end of the URL (or inserted just before the anchor). 
	var addParam = function(url, key, value) {
        var queryStrPos = url.indexOf('?');
		var anchorStrPos = url.lastIndexOf('#');
		
		var paramSeparator = '&';
		
		if(queryStrPos < 0) {
			// There's no query string.
			paramSeparator = '?';
		}
		
		if (anchorStrPos > 0) {
			// There's an anchor at the end, we need to insert our parameter before it
			var urlBeforeAnchor = url.substring(0, anchorStrPos);
			var urlAnchor = url.substring(anchorStrPos);
			return urlBeforeAnchor + paramSeparator + key + '=' + value + urlAnchor;
		} else {
			return url + paramSeparator + key + '=' + value;
		}
    };
	
	// Returns the URL with all of the parameters added to it. 
	// If the paramsObj is null or undefined, the URL is returned untouched.
	// paramsObj contains key/values of all of the parameters.
	var addParams = function(url, paramsObj) {
		if(!paramsObj || typeof paramsObj !== "object") {
			return url;
		}
		
		_.each(_.keys(paramsObj), function(paramName) {
			url = addParam(url, encodeURIComponent(paramName), encodeURIComponent(paramsObj[paramName]));
		});
		
		return url;
	};
	
	/**
	 * If the method is GET, the config.url string will have any parameters in the config.params added to it appropriately.  
	 * 
	 * If the method is POST and there is no config.postData, the config.params object will be changed to a string. The form of this string will be "param1key=param1value&param2key=param2value". Each key and value will be encoded using encodeURIComponent().
	 * If the method is POST and there is a config.postData string, the config.params object will be changed to be the same as the postData string. No encoding will take placed.
	 */
	var configureParams = function(config) {
		var hasParams = (typeof config.params === 'object');
		var hasFiles = _.isArray(config.attachments);
		
		if('GET' === config.method) {
			if(hasParams) {
				config.url = addParams(config.url, config.params);
			}
			if (hasFiles) {
				throw new Error("Cannot upload files with a GET request");
			}	
		} else if('POST' === config.method) {
			if(typeof config.postData !== "undefined") {
				// We have raw POST data to send up so we give it no further treatment.
				config.params = config.postData;
			} else if (hasFiles) {
				if (hasParams) {
					config.paramMap = config.params;
					_.each(config.attachments, function (filestats) {
						api.normalizeAPI({    
							'string': {
								mandatory: ['filename'],
								optional: ['contentType', 'name']
							}
						}, filestats);
					});
				}
			} else if(hasParams) {
				// We have a bunch of key/values, so we need to encode each of them.
				// A string like a posted form is created. e.g. "param1key=param1value&param2key=param2value"
				var paramsWithQuestion = addParams('', config.params);
				config.params = paramsWithQuestion.substring(1); // Lop off the '?' at the head
			}
			

		}
	};
	
	/**
	 * Download a JSON response.
	 * 
	 * @param {Object} config An object with all of the parameters. It can contain the following keys:
	 * 
	 * url: 
	 * Required URL to get the JSON from. 
	 * It is fine if it has a query string, but it's also possible to pass in parameters with the optioanl params key.
	 * 
	 * method:
	 * Optional, but if it is provided, it must be either "GET" or "POST".
	 * If it is not provided, a GET request will be made.
	 * 
	 * params: 
	 * Optional object containing key/values of all the parameters to add to the request. 
	 * If the method is GET, then this module will append the parameters to the URL, taking care to retain any existing query string and/or anchor. 
	 * If the method is POST, then the Networking-backend module is responsible for appending the parameters to the post. The config object passed to the backend module will have its config.params object changed to a string in the form "param1key=param1value&param2key=param2value" (NB: each key and value is encoded with encodeURIComponent())
	 * 
	 * postData:
	 * Only applicable if the method is POST and the "params" object has not been specified.
	 * For POST methods, this will be the unadulterated content of the post itself.
	 */
    exports.downloadJSON = function (config) {
        var api = require("api-utils");
        api.normalizeAPI({
            'string': {
                mandatory: ['url'],
                defaults: {'method': 'GET', 'contentType': "application/x-www-form-urlencoded"},
				optional: ['postData']
            },
            'function': {
                mandatory: ['payload'],
                optional: ['onError']
            },
            'object': {
				optional: ['params']
			}
        }, config);
		
		configureParams(config);
		
        wrapCallbacks(config, "payload", "onError");
        backend.downloadJSON_(config);
    };
        
	/**
	 * Just like the exported downloadJSON, but this takes a function called "each".
	 * The each function is applied to each item in the downloaded JSON array.
	 * The optional onFinish function is called when it's all complete.
	 * The envelope function?? TODO: Document the envelope function 
	 */
    exports.downloadJSONList = function (config) {

        
        api.normalizeAPI({    
            'string': {
                mandatory: ['url'],
                defaults: {'method': 'GET', 'contentType': "application/x-www-form-urlencoded"},
				optional: ['postData']
            },
            'function': {
                mandatory: ['each'],
                optional: ['onFinish', 'onError', 'envelope']
            },
            'array': {
                defaults: {'path':[]}
            },
            'object': {
				optional: ['params']
			}
        } , config);
        
		configureParams(config);
		
        // TODO this needs to be in a util method.
        wrapCallbacks(config, "each", "onFinish", "onError", "envelope");
        
        backend.downloadJSONList_(config);
    };
    
    exports.downloadFileToDisk = function (config) {
        var api = require("api-utils");
        
        api.normalizeAPI({    
            'string': {
                mandatory: ['url', 'filename', 'fileArea'],
                defaults: {'method': 'GET', 'contentType': "application/x-www-form-urlencoded"},
				optional: ['postData']
            },
            'function': {
                optional: ['onFinish', 'onError']
            },
            'object': {
                optional: ['headers']
            }
        } , config);
        
        wrapCallbacks(config, "onFinish", "onError");
        
        backend.downloadFile_(config);
    };
    
    // TODO Needs implementing on Android and iOS
    exports.downloadString = function(config) {
        var api = require("api-utils");
        api.normalizeAPI({
            'string': {
                mandatory: ['url'],
                defaults: {'method': 'GET', 'contentType': "application/x-www-form-urlencoded"},
                optional: ['postData']
            },
            'function': {
                mandatory: ['payload'],
                optional: ['onError']
            },
            'object': {
                optional: ['params']
            }
        }, config);
        
        configureParams(config);
        
        wrapCallbacks(config, "payload", "onError");
        backend.downloadString_(config);
    };
    
    exports.deleteDownloadedFile = function (config) {
        var api = require("api-utils");
        
        config = api.normalizeAPI({    
            'string': {
                defaultProperty: 'filename',
                mandatory: ['filename'],
                optional: ['url']
            },
            'function': {
                optional: ['onFinish', 'onError']
            }
        } , config);
        
        wrapCallbacks(config, "onFinish", "onError");
        
        backend.deleteDownloadedFile_(config);
    };
});
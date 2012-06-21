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


var backend;

var api, 
    kirin;

var backgroundIntervalTimer = null, 
	waitForNetworkAvailability = null;

var _ = require("underscore");

exports.onLoad = function (nativeObject) {
    backend = nativeObject;
    
    api = require("../utils/api-utils");
    kirin = require("kirin");
};

exports.onStart = function () {
	// nop
};

exports.onStop = function ()  {
	if (backgroundIntervalTimer) {
		require("./Timers").clearInterval(backgroundIntervalTimer);
	}
};

var backgroundListeners = {};
var noopListenerId = "__NOP__";

exports.onResume = function () {
	// start trying to ping the webhooks that have been saved.
	
	if (!backgroundListeners[noopListenerId]) {
		var nop = function () {};
		exports.registerBackgroundListener(noopListenerId, nop, nop);
	}
	
	if (!backgroundIntervalTimer) {
		exports.networkIsAvailable();
	}
	waitForNetworkAvailability();
	console.debug("Networking has been resumed");
};

exports.onUnload = function () {
    backend = null;
    
    api = null;
    kirin = null;
};


var wrapCallbacks = function (config, methodName) {
	return kirin.wrapCallbacks(config, "Networking." + methodName);
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
        var string = paramsObj[paramName];
        if (typeof string === 'object') {
            string = JSON.stringify(string);
        }
        url = addParam(url, encodeURIComponent(paramName), encodeURIComponent(string));
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
                config.paramMap = _.clone(config.params);
                _.each(config.paramMap, function (num, key) {
                    var value = config.paramMap[key];
                    if (value === null) {
                        delete config.paramMap[key];
                    }
                });
                
                delete config.params;
                _.each(config.attachments, function (filestats) {
                    api.normalizeAPI({    
                        'string': {
                            mandatory: ['name'],
                            oneOf: ['filename', 'fileArea', 'filePath'],
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
    var api = require("../utils/api-utils");
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
            optional: ['params', 'headers']
        },
        'array': {
            optional: ['attachments']
        }
    }, config);
    
    configureParams(config);
    
    wrapCallbacks(config, "downloadJSON");
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
            optional: ['attachments'],
            defaults: {'path':[]}
        },
        'object': {
            optional: ['params', 'headers']
        }
    } , config);
    
    configureParams(config);
    
    // TODO this needs to be in a util method.
    wrapCallbacks(config, "downloadJSONList");
    
    backend.downloadJSONList_(config);
};

exports.downloadFileToDisk = function (config) {
    var api = require("../utils/api-utils");
    
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
        },
        'boolean': {
        	defaults: {
        		overwrite: false
        	}
        }
    } , config);
    
    wrapCallbacks(config, "downloadFileToDisk");
    
    backend.downloadFile_(config);
};
exports.downloadFile = exports.downloadFileToDisk;


// TODO Needs implementing on Android
exports.downloadString = function(config) {
    var api = require("../utils/api-utils");
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
            optional: ['params', 'headers']
        },
        'array': {
            optional: ['attachments']
        }
    }, config);
    
    configureParams(config);
	var payload = config.payload;
	config.payload = function (lines) {
		payload(decodeURIComponent(lines));
	};
    wrapCallbacks(config, "downloadString");
    backend.downloadString_(config);
};


var webHooksFileArea = "internal";
var webHooksDir = "/kirin/networking/webhooks/";
var nopFunction = function () {};
/**
 * Register a listener for the given id for completion 
 * of a successful download.
 * 
 * The arguments passed to the listener will be whatever context is passed 
 * to the initial <code>backgroundRequest</code> method that initiates the download.
 * 
 * The listener will be called with two arguments: context, response. The context is set at the time 
 * of the request; the response comes from the http request itself.
 * 
 * It is recommended that the registration of background listeners is done very early 
 * on in the lifecycle of the app.
 */ 
exports.registerBackgroundListener = function (listenerId, listener, timeoutListener) {
	listener = listener || nopFunction;
	timeoutListener = timeoutListener || nopFunction;
    if (!_.isString(listenerId) || !_.isFunction(listener)) {
        throw new Error("ListenerId should be a string, listener should be a function");
    }
    if (timeoutListener && !_.isFunction(timeoutListener)) {
        throw new Error("timeoutListener is optional, though should be a function");
    }
        
    backgroundListeners[listenerId] = [listener, timeoutListener];
};

/**
 * Remove the background listener with the given download.
 *
 * This will not cancel requests that are in-flight, and will not prevent 
 * already saved requests from being re-sent if this is reregistered. 
 */
    exports.unregisterBackgroundListener = function (listenerId) {
        delete backgroundListeners[listenerId];
    };
   
    /*
 * This will remove all previously saved requests for this listenerId. 
 * It will not cancel requests that are being made right now (a.k.a. in-flight requests).
 * The callback and errback are called once the requests have been removed.
 */
exports.cancelAllBackgroundRequests = function (listenerId, callback, errback) {
	var fs = require("device-filesystem-alpha");
		fs.remove({
			fileArea: webHooksFileArea, 
			filename: webHooksDir + listenerId,
			callback: callback,
			errback: errback
		});
   	};
   
   	function callBackgroundListener (listenerId, context, response) {
        var callback;
        var callbacks = backgroundListeners[listenerId];

        if (callbacks) {
            callback = callbacks[0];
        }
        
        if (callback) {
            try {
                callback(context, response);
            } catch (e) {
                console.dir(e);
                throw new Error("Networking.backgroundRequest: Error found calling callback for listener id: " + listenerId);
        }
    } else {
        throw new Error("Networking.backgroundRequest: Cannot find a callback for listener id: " + listenerId);
    }
}
exports.callBackgroundListener = callBackgroundListener;

var execDifferentialDownload = function (config, systemCallback) {

    var listenerId = config.listenerId;
	var payload = function (response) {
	    callBackgroundListener(listenerId, config.context, response);
        if (systemCallback) {
        	try {
        		systemCallback();
        	} catch (e1) {
        		console.dir(e1);
				throw new Error("Networking.backgroundRequest: Error found calling callback for listener id: " + listenerId);
        	}
        }
    };

    config.onError = function (err) {
        console.error("Networking: " + err + " URL: " + config.url);
        console.error(config);
    };
    
    if (config.binary) {
    	config.onFinish = payload;
    	exports.downloadFile(config);
    } else {
    	config.payload = payload;
        exports.downloadString(config);    
    }

};   

var resendWebHooks = (function () {
    var fs = require("device-filesystem-alpha");

    function remove (filePath) {
        fs.remove({
            filePath: filePath,
            callback: function () {}
        });
    }
    
    function resend (filePath, config) {
    
        if (config.lastAttempt < Date.now()) {
            // if the file is too old, then discard it.
            // TODO call the relevant timeoutCallback
            remove(filePath);
        } else {
            execDifferentialDownload(config, function () {
                // on successful download
                remove(filePath);                
            });
        }
    }
    
    return function (fileRefs) {
        _.each(fileRefs, function (fileRef) {
            
            if (fileRef.isDirectory) {
                console.error("File ref is a directory, skipping");
                return;
            }
        	
            fs.readJson({
                filePath: fileRef.filePath,
                callback: function (config) {
                    resend(fileRef.filePath, config);            
                }    
            });
        
        
        });
    };    
})();


exports.networkIsAvailable = function () {
    var fs = require("device-filesystem-alpha");

	var numFiles = 0;
	var numDirectories = _.size(backgroundListeners);

	function perhapsStopPolling () {
		numDirectories --;
		if (numDirectories === 0 && numFiles === 0 && backgroundIntervalTimer) {
			require("./Timers").clearInterval(backgroundIntervalTimer);
			backgroundIntervalTimer = null;
		}		
	}
	
	function counterDecorator (files) {
		numFiles += files.length;
		resendWebHooks(files);
		perhapsStopPolling();
	}

    _.each(backgroundListeners, function (i, key) {
        fs.listDir({
            callback: counterDecorator,
            errback: perhapsStopPolling,
            fileArea: webHooksFileArea,
            filename: webHooksDir + key
        });            

    });
};

waitForNetworkAvailability = function () {
    if (backgroundIntervalTimer === null) {
        var timers = require("./Timers");
        backgroundIntervalTimer = timers.setInterval(exports.networkIsAvailable, 60 * 1000);
    }
};


/**
 * Send an HTTP Request reliably. 
 *
 * If the request does not return successfully, then it is stashed for a later attempt.
 * On success, the listener registered with <code>registerBackgroundListener</code> 
 * with the id given by <code>listenerId</code>.
 * 
 * If the app is put into the background, then the request is shelved, ready for 
 * when the app comes back into foreground.
 * 
 * Mandatory arguments: 
 *  * listenerId - the id of the listener that will be fired on success.
 * Optional arguments: 
 *  * context - the object that will be persisted along side the rest of the request. This will be passed to 
 *  the background listener on completion. This will go through a JSON stringify and parse, so cannot contain functions.
 *  * maxAgeSeconds - the amount of time in seconds while an unsuccessful request 
 * will be retried. Default is 60 * 60 * 24 * 365 (i.e. 1 year).
 *  * binary - boolean flag to suggest that the response data is saved onto disk. If <code>true</code>, 
 * then <code>downloadFileToDisk</code> is used. Otherwise, <code>downloadString</code> is used. By default, this is false.
 * 
 * Other arguments that are not functions will be necessary to drive the backing methods.
 */
exports.backgroundRequest = function (config) {
	
    var api = require("../utils/api-utils");
    var fs = require("device-filesystem-alpha");
    config.listenerId = config.listenerId || noopListenerId;
    api.normalizeAPI({
        'string': {
            mandatory: ['listenerId']
        },
        'number': {
            defaults: {
                'maxAgeSeconds': 365 * 24 * 3600 // 1 year
            }
        },
        'boolean': {
        	defaults: {
        		binary: false
        	}
        },
        object: {
            defaults: {
                'context': {}
            }
        }
    }, config);


    // NB we will be using the downloadString API, so the config should conform to that too. 
    var listenerId = config.listenerId;
    if (listenerId === noopListenerId) {
    	console.warn("A default background listener has been used where none was specified.");
    }
    
    config.lastAttempt = Date.now() + config.maxAgeSeconds * 1000;
    
    config.onError = function (err, statusCode) {
        fs.writeString({
            fileArea: webHooksFileArea,
            filename: webHooksDir + "/" + listenerId + "/" + listenerId + Date.now() + ".json",
            contents: JSON.stringify(config),
            callback: function (filename) {
                waitForNetworkAvailability();
            },
            errback: function (err) {
                console.error(err);
            }
        });
        
        
    };

    if (!backgroundListeners[listenerId]) {
        throw new Error("A background listener with id '" + config.listenerId + "' has not been registered");
    }
    
    execDifferentialDownload(config);
};


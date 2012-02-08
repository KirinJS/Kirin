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

defineModule("Networking-backend", function (require, exports) {
    var backend = {},
        kirin = require("kirin");
    
    backend.replaceableCreateXMLHttpRequest = function () {
        return new XMLHttpRequest();
    };
    
	/** 
	 * Actaully opens up the XHR request and calls callbacks when it has downloaded, timed out, or failed.
	 * 
	 * @param {Object} method Required "GET" or "POST"
	 * @param {Object} url Required 
	 * @param {Object} callback Required success callback. Called with the parsed JSON response.
	 * @param {Object} errback Required error callback. Called with a developer friendly string error message passed as argument.
	 * @param {Object} postParamString Optional string for use when the method is "POST". Contains the parameters for the POST (format is like "foo=bar&qwaggly=fitzherbert". There is no '?' at the start).
	 */
    backend.replaceableDownloadJSON = function (method, url, callback, errback, postParamString, contentType) {
        var xhr = backend.replaceableCreateXMLHttpRequest();
	    var readyState3Status;
        xhr.open(method, url);
        if(method === "POST") {
            xhr.setRequestHeader("Content-type", contentType);
            xhr.setRequestHeader("Content-length", postParamString ? postParamString.length : 0);
            xhr.setRequestHeader("Connection", "close");
		} else if (method === "GET") {
			xhr.setRequestHeader('Accept', 'application/json');
		}
		if (!xhr.getRequestHeader || !xhr.getRequestHeader("User-Agent")) {
			xhr.setRequestHeader("User-Agent", "Qt/Kirin-0.5");
		}
		
		var requestTimer = backend.replaceableSetTimeout(function() {
			xhr.onreadystatechange = function () {};
			xhr.abort();
			errback("Timeout");
		}, 5 * 60 * 1000);
        
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 3) {
                // SAVE the status
                // If we have an ERROR, then when readyState gets to 4, the status is set to 0!
                // But it will still have its true value at this point!!!
                readyState3Status = xhr.status;
                return;
            }
            
            if (xhr.readyState !== 4) {
                return;
            }
            
            backend.replaceableClearTimeout(requestTimer);
            if (xhr.status !== 200) {
				errback(readyState3Status);
                return;
            }
            callback(xhr.responseText);
        };
		
		if (method === "POST" && postParamString) {
			xhr.send(postParamString);
		} else {
			xhr.send();
		}
    };
    
    backend.replaceableClearTimeout = require("window").clearTimeout;
    backend.replaceableSetTimeout = require("window").setTimeout;
 
    var cleanup = function (config) {
        var deleteCallback = kirin.native2js.deleteCallback;
        var callbacks = ["each", "onFinish", "onError", "envelope", "payload"];
        for (var i=0, max=callbacks.length; i<max; i++) {
            var cb = config[callbacks[i]];
            if (cb) {
                deleteCallback(cb);
            }
        }
    };
    
    var errorAndExit = function (config, err) {
        var errback = config.onError;
        if (errback) {
            kirin.native2js.callCallback(errback, err);
        }
        cleanup(config);
    };
    
    /*
     * Separate the JSON into a list and an envelope.
     * If the obj is an envelope with a list in it, we want to take the list 
     * out of the envelope. We should've been given a path to that list. 
     */
    var findListInObject = function (path, obj) {
        
        if (_.isArray(obj)) {
            // we found the list straight away, 
            // return it as a list, but nothing for the "envelope"
            return [null, obj];
        }
        
        var orig = obj, 
            parent, key;
        
        for (var i=0, max=path.length; i<max; i++) {
            key = path[i];
            parent = obj;
            obj = parent[key];
            if (obj) {
                if (_.isArray(obj)) {
                    delete parent[key];
                    return [orig, obj];
                }
            } else {
                break; 
            }
        }
        
        // we couldn't find the list according to the path, 
        // so return the original and no list.
        return [orig, null];
    };
    
    backend.downloadJSONList_ = function(config) {
        var processJSON = function (response) {
            var obj = JSON.parse(response);
            var envelopeAndArray = findListInObject(config.path, obj);
            var envelope = envelopeAndArray[0],
                items = envelopeAndArray[1], max=0,
                callCallback = kirin.native2js.callCallback;
            
            if (envelope) {
                callCallback(config.envelope, envelope);
            }
            if (items) {
                max=items.length;
                var keyholeSize = 3;
                var count = 0;
                var sendToEach = function (start) {
                    return function () {
                        var end = Math.min(start + keyholeSize, max);
                        for (var i=start; i<end; i++) {
                            callCallback(config.each, items[i]);
                            count ++;
                        }
                        
                        if (count === max) {
                            callCallback(config.onFinish, max);
                            cleanup(config);
                        }
                    };
                };
                
                if (max) {
                    for (var i=0; i<max; i+=keyholeSize) {
                        backend.replaceableSetTimeout(sendToEach(i), 10);
                    }
                } else {
                    sendToEach(0)();
                }
                
                
            } else {
                callCallback(config.onFinish, 0);
                cleanup(config);
            }
            
        };
        
        backend.replaceableDownloadJSON(config.method, config.url, processJSON, _.bind(errorAndExit, null, config), config.params, config.contentType);
    };
    
    backend.downloadJSON_ = function (config) {
        var processJSON = function (response) {
            var obj = JSON.parse(response);
            kirin.native2js.callCallback(config.payload, obj);
            cleanup(config);
        };
        backend.replaceableDownloadJSON(config.method, config.url, processJSON, _.bind(errorAndExit, null, config), config.params, config.contentType);
    };
    

    backend.downloadString_ = function (config) {
        var processResponse = function (response) {
            kirin.native2js.callCallback(config.payload, response);
            cleanup(config);
        };
        backend.replaceableDownloadJSON(config.method, config.url, processResponse, _.bind(errorAndExit, null, config), config.params, config.contentType);
    };
    
	backend.replaceableSaveOffInternet = function (filename, url, headers, onSuccess, onError) {
		//saveOffInternet(const QString &fileName, const QString &url, const QScriptValue &win, const QScriptValue &fail = QScriptValue())
		
		var settings = require("Settings"),
			localFiles = kirin.proxy("cppLocalFiles"),
			rootDir = settings.get("APP_ROOT_PATH"),
			re = /^\/?([^\/].*?\/)([^\/]+)$/;
			
		var result = re.exec(filename);
		
		if (result) {
			var relativeDir = result[1];
			var simpleFilename = result[2];
			
			if (relativeDir !== "/") {
				console.log("Making a directory in " + rootDir + " for " + relativeDir);
				if (!localFiles.mkdir(rootDir, relativeDir)) {
					onError("Cannot create a directory " + relativeDir + " in " + rootDir);
					return;
				}
			}
		}

		var path = rootDir + filename;
		
		localFiles.saveOffInternet(path, url, headers, onSuccess, onError);
		
	};
    
    backend.downloadFile_ = (function () {
        
        var configQueue = [];
        
        var isSleeping = true;
        
        var continueDownloading = null;
        
        function wrapContinuation (config, callbackId) {
            
            return function (arg) {
                if (configQueue.length === 0) {
                    isSleeping = true;
                } else {
                    continueDownloading();
                }
                if (config[callbackId]) {
                    kirin.native2js.callCallback(config[callbackId], arg);
                }
                cleanup(config);
            };
        }
        
        continueDownloading = function () {
            var config = configQueue.shift();
            backend.replaceableSaveOffInternet(config.filename, config.url, config.headers || {}, 
                    wrapContinuation(config, "onFinish"), 
                    wrapContinuation(config, "onError")
            );
        };
        
        
        return function (config) {
            configQueue.push(config);
            if (isSleeping) {
                isSleeping = false;
                continueDownloading();
            }
        };
    })();
    
    
 
    
    backend.deleteDownloadedFile_ = function (config) {
          var settings = require("Settings"),
            localFiles = kirin.proxy("cppLocalFiles"),
            rootDir = settings.get("APP_ROOT_PATH");
        
        localFiles.del(rootDir + config.filename);
          
        kirin.native2js.callCallback(config.onFinish);
        cleanup(config);
    };
    
    kirin.native2js.registerProxy("Networking-backend", backend);
});
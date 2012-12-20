function KirinXMLHTTPRequest () {
    // No properties declared
}
module.exports = KirinXMLHTTPRequest;
var _ = require("underscore");

var kirinModule = KirinXMLHTTPRequest.prototype,
    instance;


/*
 * Lifecycle methods.
 * These should match corresponding native objects, via kirinHelpers
 */
kirinModule.onLoad = function (nativeObject) {
    // The native object can be called with this object
    instance = this;
    this.nativeObject = nativeObject;
};

kirinModule.onResume = function () {
     // A screen would get this viewWillAppear or onResume
     // TODO Implement onResume
};

kirinModule.onPause = function () {
     // A screen would get this viewWillDisappear or onPause
     // TODO Implement onPause
};

kirinModule.onUnload = function () {
    this.nativeObject = null;
};



/*
 * Method stubs
 */

/**
 * @param newState {@link a string}
 */
kirinModule.onConnectivityStateChange = function (newState) {
    // TODO Copy/paste this stub, and implement
    throw new Error("onConnectivityStateChange is unimplemented");
};

function isConnectedToNative() {
    return (instance && instance.nativeObject);
}

var Request = require("./KirinXHRequest"),
    RealRequest = typeof window !== 'undefined' ? window.XMLHTTPRequest : null,
    events = require("events");


/*******************************
 * Constructor
 */
function XMLHTTPRequest (params) {
    
}


var XHR = XMLHTTPRequest.prototype = new Request();
    





/*******************************
 * Methods called by native
 */

// TODO make sure we can download enormous chunks of text.

/*
    _doOnInitialisationError: [{"errorMessage": "string"}],
    _doOnConnect: [{"responseHeaders": "object"}, {"event":"KirinXHRProgressEvent"}],
    _doOnAppendPayload: [{"text":"string"}, {"event":"KirinXHRProgressEvent"}],
    _doOnRequestComplete:[{"statusCode":"integer"}, 
                          {"response":"KirinXHRResponse"}, 
                          {"event":"KirinXHRProgressEvent"}],
    _doOnInterrupt: [{"errorMessage": "string"}],
    _doUploadProgress:[{"eventType":"string"}, {"event":"KirinXHRProgressEvent"}]
 */

XHR._doOnConnect = function (responseHeaders, event) {
    var self = this;
    self.responseText_array = [];
    self.responseHeaders = responseHeaders;
    
    self._setReadyState(3);
    
    // what to do with event.
};

XHR._doOnAppendPayload = function (text, event) {
    var self = this;
    self.responseText_array.push(text);
};

XHR._doOnRequestComplete = function (statusCode, responseObject, progressEvent) {
    var self = this,
        responseText = self.responseText_array.join(),
        responseType = self.responseType || "text";
    
    delete self.responseText_array;
    _.extend(self, responseObject);
    
    if (typeof responseText === 'string') {
        self.responseText = responseText;
        if (responseType === "text" || responseType === "") {
            self.response = responseType;
        } else if (responseType === "json") {
            try {
                self.response = JSON.parse(responseText);
            } catch (e) {
                // there's been a server fuckup here,
                console.error("responseText from " + self.url + " is not valid JSON", e);
            }
        } else if (responseType === "document") {
            // TODO test responseType == document.
            try {
                if (RealRequest) {
                    // not sure how good this will be with IE for WP7/8
                    self.responseXML = new window.DOMParser().parseFromString(responseText, "text/xml");
                }
            } catch (e) {
                console.error("Cannot parse responseText into XML");
            }
        }
    }
    
    self._setReadyState(4);
    if (self._emitter) {
        self._emitter.emit("load", progressEvent);
    }
    
    if (self.onload) {
        self.onload();
    }
    
    if (statusCode !== 200) {
        // we should probably do something right here.
    }
};

XHR._doOnInitialisationError = function (errorMessage) {
    // TODO _doOnInitialisationError
};


/*******************************
 * Utility methods
 */

XHR._setReadyState = function (newReadyState) {
    var self = this;
    self.readyState = newReadyState;
    if (self.onreadystatechange) {
        self.onreadystatechange();
    }
};

/*******************************
 * Preparing the request, either for native or browser's own.
 */

function prepareNativeRequest (self) {

    if (self.onreadystatechange) {
        self._doOnReadyStateChange = function (readyState) {
            self.readyState = readyState;
            self.onreadystatechange();
        };
    }
    
    if (self._emitter) {
        self._doUploadProgress = function (eventType, event) {
            event.lengthComputable = (event.loaded >= 0) && (event.total > 0); 
            self._emitter.emit(eventType, event);
        };
    }

    return self;
}

function copyToBrowserRequest(self, request) {

    _.extend(request, self);
 
    // copy things with methods over to the request object.
    _.each(self.requestHeaders, function (i, k) {
        request.addRequestHeader(k, self.requestHeaders[k]);
    });
    
    
    if (self._emitter) {
        if (request.addEventListener) {

            var copyListeners = function (type, list) {
                _.each(list, function (listener) {
                    request.addEventListener(listener);
                });
            };
            
            _.each(["progress", "load", "error", "abort"], function (event) {
                copyListeners(event, self._emitter.listeners(event));
            });
        }
        
        
    }
    
    return request;
}


/*******************************
 * Public api
 */

XHR.open = function (method, url, asynchronous) {
    var self = this, 
        request = self;
    method = (method || "GET").toUpperCase();
    
    if ((method === "GET" || !asynchronous) && RealRequest) {
        request = new RealRequest();
        copyToBrowserRequest(self, request);
        
        request.open(method, url, asynchronous);
        
        self.realRequest = request;
    } else {
        self._setReadyState(1);
        self.method = method;
        self.url = url;
    }
};



XHR.send = function (data) {
    var self = this,
        request = self.realRequest || self;
    
    if (self.realRequest) {
        request.send(data);
    } else if (isConnectedToNative()) {
        request = prepareNativeRequest(self);
        
        // update the ready state.
        self._setReadyState(2);
        instance.nativeObject.open(request);
    }
};

XHR.abort = function () {
    if (this.realRequest) {
        this.realRequest.abort();
        return;
    }
    if (isConnectedToNative() && this.readyState >= 2) {
        instance.nativeInstance.abort(this.__id);
    }
};

XHR.setRequestHeader = function (headerName, headerValue) {
    if (!this.requestHeaders) {
        this.requestHeaders = {};
    }
    this.requestHeaders[headerName] = headerValue;
};

XHR.addEventListener = function (eventType, callback, bool) {
    var self = this;
    if (!self._emitter) {
        self._emitter = new events.EventEmitter();
    }
    self._emitter.once(eventType, callback);
};

XHR.getResponseHeader = function (headerName) {
    var self = this;
    if (self.readyState > 2) {
        return self.responseHeaders[headerName];
    }
    return null;
};

XHR.getAllResponseHeaders = function () {
    var self = this;
    if (self.readyState > 2) {
        return self.responseHeaders;
    }
    return null;
};

XHR.overrideMimeType = function (mimeType) {
    // TODO
    var self = this;
    if (self.readyState >= 3) {
        throw new Error("InvalidStateError");
    }
    self.setRequestHeader("Content-Type", mimeType);
};

kirinModule.XMLHTTPRequest = XMLHTTPRequest;

if (RealRequest) {
    window.XMLHTTPRequest = XMLHTTPRequest;
}
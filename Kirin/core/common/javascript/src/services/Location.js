defineModule("Location", function (require, exports) {
    
    var backend;
    
    var callbacks = [];
    var errbacks = [];
    
    var latestLocation = null;
    
    exports.onLoad = function (nativeObject) {
        backend = nativeObject;
    };

    exports.onUnload = function () {
        backend = null;
    };
    
    function stopListening () {
        backend.stop();
        callbacks = [];
        errbacks = [];
    }

    
    function onLocationUpdate (newLocation) {
    	console.log("Location: onLocationUpdate");
        latestLocation = newLocation;
        _.each(callbacks, function (cb) {
            cb(newLocation);
        }); 
    }

    function onLocationError (err) {
    	console.log("Location: onLocationError");
        _.each(errbacks, function (eb) {
            eb(err);
        });
    	if (err === "denied") {
    		stopListening();
    	}
    }
    
    exports.registerLocationListener = function (listener) {
    
        if (!_.isFunction(listener)) {
            throw new Error("Listener is not a function");
        }
        var index = _.indexOf(callbacks, listener);
        if (index >= 0) {
        	return;
        }
        callbacks.push(listener);
        
        // if this is the first time we've been asked for location, 
        // then we should tell native.
        if (callbacks.length === 1) {
            
            var wrapCallback = require("kirin").wrapCallback;
            
            backend.startWithCallback_andErrback_(
                wrapCallback(onLocationUpdate, "Location.", "callback."),
                wrapCallback(onLocationError, "Location.", "errback.")
            );
            
        }
    };
    
    exports.registerLocationErrorListener = function (errback) {
    	if (!_.isFunction(errback)) {
            throw new Error("LocationErrorListener is not a function");
        }    	
    	
    	var index = _.indexOf(errbacks, errback);
        if (index >= 0) {
        	return;
        }
        
        errbacks.push(errback);
    };

    exports.refreshLocation = function () {
        backend.forceRefresh();
    };


    exports.unregisterAllListeners = stopListening;
    
    function removeFromList (list, item) {
        var index = _.indexOf(list, item);
        if (index < 0) {
            return false;
        }
        
        list.splice(index, 1);
        return true;
    }

    exports.unregisterLocationListener = function (listener) {
        if (!removeFromList(callbacks, listener)) {
        	
        	console.log("Location listener not removed because it wasn't registered");
            return false;
        }
        if (callbacks.length === 0) {
            stopListening();
        }
        
        return true;
    };
    
    exports.registerLocationErrorListener = function (errback) {
    	return removeFromList(errbacks, errback);
    };
    

});
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
    
    function onLocationUpdate (newLocation) {
        latestLocation = newLocation;
        _.each(callbacks, function (cb) {
            cb(newLocation);
        }); 
    }

    function onLocationError (err) {
        _.each(errbacks, function (eb) {
            
        });
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

    exports.refreshLocation = function () {
        backend.forceRefresh();
    };

    function stopListening () {
        backend.stop();
        callbacks = [];
    }

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
        console.log("Removing listener from location update");
        if (!removeFromList(callbacks, listener)) {
            return;
        }
        
        console.log("There is still " + callbacks.length + " functions listening");
        
        if (callbacks.length === 0) {
            stopListening();
        }
        
        
    };
    
    

});
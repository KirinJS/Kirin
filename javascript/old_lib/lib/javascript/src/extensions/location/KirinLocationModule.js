var EventEmitter = require("events").EventEmitter,
    _ = require("underscore");

function KirinLocationModule () {
    this.emitter = null;
    this.backend = null;
    this.latestLocation = null;
}

var instance = KirinLocationModule.prototype;


instance.onLoad = function (nativeObject) {
    this.emitter = new EventEmitter();
    this.backend = nativeObject;
};

instance.onUnload = function () {
    this.backend = null;
};

instance._stopListening = function () {
    this.backend.stop();
    this.emitter.removeAllListeners();
};


instance.registerLocationListener = function (listener) {
    var self = this;
    self.emitter.addListener("update", listener);
    
    // if this is the first time we've been asked for location, 
    // then we should tell native.
    if (self.emitter.getListeners("update").length === 1) {
        var KirinLocationListener = require("./KirinLocationListener"),
            locationListener = new KirinLocationListener({
                locationUpdate: function (location) {
                    self.latestLocation = location;
                    self.emitter.emit("update", location);
                    return true;
                },
                
                locationError: function (errorMessage) {
                    self.emitter.emit("error", errorMessage);
                    if (errorMessage === "denied") {
                        self._stopListening();
                    }
                    return true;
                },
                
                locationUpdateEnding: function () {
                    // return falsey to remove the listener from the JS callback cache.
                    return false;
                },
                
                updatePermissions: function (permissions) {
                    self.emitter.emit("permissions", permissions);
                    return true;
                }
            });
        
        console.log("Location: Starting the Location Services");
        self.backend.startWithLocationListener(locationListener);
    }
};

instance.registerLocationErrorListener = function (errback) {
    this.emitter.addListener("error", errback);
};

instance.refreshLocation = function () {
    this.backend.forceRefresh();
};

instance.unregisterAllListeners = instance._stopListening;

instance.unregisterLocationListener = function (listener) {
    this.emitter.removeListener("update", listener);
    if (this.emitter.getListeners("update").length === 0) {
        this._stopListening();
    }
};

instance.unregisterLocationErrorListener = function (errback) {
    this.emitter.removeListener("error", errback);
};

instance.getLocationPermissions = function (callback) {
    var self = this;
    var cb = function (permissions) {
        callback(permissions);
        self.emitter.removeListener("permissions", callback);
    };    
    self.emitter.addListener("permissions", cb);
    self.backend.updatePermissions();
};

module.exports = new KirinLocationModule();
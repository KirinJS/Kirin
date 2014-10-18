var _ = require("underscore"),
    EventEmitter = require("events").EventEmitter;

function KirinPreferences () {
    // No properties declared
    this.keyValuePairs = null;
    this.deletedKeys = null;
    this.emitter = new EventEmitter();
}

var instance = KirinPreferences.prototype;

/*
 * Lifecycle methods.
 * These should match corresponding native objects, via kirinHelpers
 */
instance.onLoad = function (nativeObject) {
    // The native object can be called with this object
    this.backend = nativeObject;
    this.keyValuePairs = {};
    this.deletedKeys = {};
    var self = this,
        KirinPreferenceListener = require("./KirinPreferenceListener"),
        listener = new KirinPreferenceListener({
            onPreferenceChange: function (key, newValue) {
                console.log("Received word that " + key + " has changed to " + newValue);
                self.keyValuePairs[key] = newValue;
                self.emitter.emit(key, key, newValue);
                return true;
            },
            onListeningEnding: function () {
                return false;
            }
        });
    self.backend.addPreferenceListener(listener);
};

instance.onResume = function () {
     // A screen would get this viewWillAppear or onResume
     // TODO Implement onResume
};

instance.onPause = function () {
     // A screen would get this viewWillDisappear or onPause
     // TODO Implement onPause
};

instance.onUnload = function () {
    this.backend = null;
    this.keyValuePairs = null;
    this.deletedKeys = null;
};

/*
 * Method stubs
 */


/**
 * @param latestNativePreferences {@link _.isObject($0) && !_.isArray($0)}
 */
instance.mergeOrOverwrite = function (latestNativePreferences) {
    this.keyValuePairs = _.extend(this.keyValuePairs, latestNativePreferences);
};

instance.resetEnvironment = function () {
    // cheat browserify
    var environment = "Environment";
    try {
        require(environment);
    } catch (e) {
        console.warn("No Environment.js module is loaded");
    }
};

/**
 * Javascript facing methods.
 */

var makeKey = function (string) {
    return string.replace(/[\/:]/g, "_");
};

instance.commit = function () {
    this.backend.updateStoreWithChangesAndDeletes(this.keyValuePairs, _.keys(this.deletedKeys));
    this.deletedKeys = {};
};

/**
 * Attempt to find a value from any of the keys passed.
 * If no values are found for any of the keys, the function returns undefined.
 */
instance.get = function () {
    var key, value;
    
    //console.log("keyValuePairs properties: " + _.keys(keyValuePairs));
    
    for (var i=0, max=arguments.length; i<max; i++) {
        key = makeKey(arguments[i]);
        value = this.keyValuePairs['' + key];
        
        //console.log("keyValuePairs[" + key + "] = " + value);
        
        if (typeof value !== 'undefined') {
            return value;
        }
    }
    // return undefined.
};

instance.put = function (key, value) {
    var internalKey = makeKey(key);
    if (value === null || typeof value === 'undefined') {
        delete this.keyValuePairs[internalKey];
        this.deletedKeys[internalKey] = true;
    } else {
        this.keyValuePairs[internalKey] = value;
        delete this.deletedKeys[internalKey];
    }
};

instance.remove = function (key) {
    var internalKey = makeKey(key);
    delete this.keyValuePairs[internalKey];
    this.deletedKeys[internalKey] = true;
};

instance.addChangeListener = function (key, listener) {
    
};


module.exports = new KirinPreferences();
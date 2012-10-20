function IDumbListScreenModule () {
    // No properties declared
}
module.exports = IDumbListScreenModule;
var instance = IDumbListScreenModule.prototype;

/*
 * Lifecycle methods.
 * These should match corresponding native objects, via kirinHelpers
 */
instance.onLoad = function (nativeObject) {
    // The native object can be called with this object
    this.nativeObject = nativeObject;
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
    this.nativeObject = null;
};

/*
 * Method stubs
 */

/**
 * @param index {@link an integer}
 * @param label {@link a string}
 */
instance.onListItemClick = function (index, label) {
    // TODO Copy/paste this stub, and implement
    throw new Error("onListItemClick is unimplemented");
};

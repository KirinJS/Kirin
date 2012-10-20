function IDumbButtonScreenModule () {
    // No properties declared
}
module.exports = IDumbButtonScreenModule;
var instance = IDumbButtonScreenModule.prototype;

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

instance.onDumbButtonClick = function () {
    // TODO Copy/paste this stub, and implement
    throw new Error("onDumbButtonClick is unimplemented");
};

instance.onNextScreenButtonClick = function () {
    // TODO Copy/paste this stub, and implement
    throw new Error("onNextScreenButtonClick is unimplemented");
};

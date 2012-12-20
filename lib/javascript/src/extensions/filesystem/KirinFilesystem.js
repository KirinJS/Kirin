
var File = require("./KirinFile"),
    KirinCallback = require("./KirinCallback"),
    KirinOptionalCallback = require("./KirinOptionalCallback"),
    _ = require("_");


function KirinFilesystem () {
    // No properties declared
}

var instance = module.exports = new KirinFilesystem();
var Module = KirinFilesystem.prototype;

/*
 * Lifecycle methods.
 * These should match corresponding native objects, via kirinHelpers
 */
Module.onLoad = function (nativeObject) {
    // The native object can be called with this object
    this.nativeObject = nativeObject;
};

Module.onResume = function () {
     // A screen would get this viewWillAppear or onResume
     // TODO Implement onResume
};

Module.onPause = function () {
     // A screen would get this viewWillDisappear or onPause
     // TODO Implement onPause
};

Module.onUnload = function () {
    this.nativeObject = null;
};

/*
 * Monkey patching generate KirinFile.
 */
File.prototype._append = function (text) {
    this.lines.push(text);
    return true;
};

/*
 * Method stubs
 */

/**
 * @param file {@link KirinFile}
 * @param callback {@link undefined}
 * @param errback {@link undefined}
 */
Module.readString = function (file, callback, errback) {
    var theFile = new File(file);
    theFile.lines = [];
    this.nativeObject.readString(
            theFile, 
            new KirinCallback({
                callback: callback ? function joinAndCallback (fileFromNative) {
                    var lines = theFile.lines;
                    delete theFile.lines;
                    _.extend(theFile, fileFromNative);
                    callback(lines.join());
                } : undefined,
                errback: errback 
            })
    );
};

/**
 * @param file {@link KirinFile}
 * @param callback {@link undefined}
 * @param errback {@link undefined}
 */
Module.readJson = function (file, callback, errback) {
    this.readString(file, function (string) {
        callback(JSON.parse(string));
    }, errback);
};

/**
 * @param file {@link KirinFile}
 * @param callback {@link undefined}
 * @param errback {@link undefined}
 */
Module.writeString = function (file, contents, callback, errback) {
    // TODO Copy/paste this stub, and implement
    throw new Error("writeString is unimplemented");
};

/**
 * @param src {@link KirinFile}
 * @param dest {@link KirinFile}
 * @param callback {@link undefined}
 * @param errback {@link undefined}
 */
Module.copy = function (src, dest, callback, errback) {
    // TODO Copy/paste this stub, and implement
    throw new Error("copy is unimplemented");
};

/**
 * @param fileOrDir {@link KirinFile}
 * @param callback {@link undefined}
 * @param errback {@link undefined}
 */
Module.list = function (fileOrDir, callback, errback) {
    // TODO Copy/paste this stub, and implement
    throw new Error("list is unimplemented");
};

/**
 * @param fileOrDir {@link KirinFile}
 * @param callback {@link undefined}
 * @param errback {@link undefined}
 */
Module.remove = function (fileOrDir, callback, errback) {
    // TODO Copy/paste this stub, and implement
    throw new Error("remove is unimplemented");
};

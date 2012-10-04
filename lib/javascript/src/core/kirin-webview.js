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

var Native = require("./Native"),
    slice = Array.prototype.slice,
    native2js = {},
    callbacks = {},
    loadedObjects = {}, 
    // XXX 'screens' is set by GWT-Exporter. 
    gwtClasses = Native.getGlobal().screens || {},
    _ = require("underscore"),
    myRequire = require;

/**********************************************************************/
/* Utility methods to help calling native from Javascript and vice versa.
 **********************************************************************/

/*
 * Make a wrap function which takes a "NativeObject" and some method names, and turns it into 
 * something we can call with a more JS-like syntax: 
 * e.g.
 * Native.exec("NativeObject.make_for_", "something", "me"); 
 * NativeObject.make_for_("something", "me");
 * should be functionally equivalent.
 */

var tokenGenerator = (function() {
    var counter = 0;
    return function (jsName, methodName) {
        var prefix = (arguments.length >= 2) ?
                jsName + methodName : "anon.";
        if (typeof prefix !== 'string'){
            prefix = "noname.";
        }
        return prefix + (counter ++);
    };
}());

var wrapCallback = function (callback, jsName, methodName) {
    if (typeof callback !== 'function') {
        return null;
    }
    var token = tokenGenerator(jsName, methodName);
    callbacks[token] = callback;
    return token;
};

var wrapCallbacks = function (config, moduleName) {
    if (typeof config !== 'object') {
        throw new Error("First argument of wrapCallbacks should be an object");
    }
    if (typeof moduleName !== 'string') {
        moduleName = "anonymousModule";
    }
    moduleName += ".";
    var key, value;
    for (key in config) {
        if (config.hasOwnProperty(key)) {
            value = config[key];
            if (typeof value === 'function') {
                config[key] = wrapCallback(_.bind(value, config), moduleName, key);
            }
        }
    }
    return config;
};

/**
 * This is the function call that every call out to native goes through.
 */
var createCallToNative = function (jsName, methodName) {
    return function () {
        var args = slice.call(arguments, 0);
        var i = 0, max, arg, util;
        for (max=args.length; i<max; i++) {
            arg = args[i];
            if (typeof arg === 'function') {
                console.error("OMG WE'RE WRAPPING AN ERRANT FUNCTION");
                args[i] = wrapCallback(arg, jsName, methodName);
            } else if (arg.kirin_bridgeUtils) {
                util = arg.kirin_bridgeUtils;
                util.fillInDefaults(arg);
                util.validate(arg);
                if (util.hasCallbacks(arg)) {
                    args[i] = util.createExportableObject(arg);
                    
                    // TODO stash the original object some place where we can use it for callbacks later.
                }
                
            }
        }
        args.unshift(jsName + "." + methodName);
        return Native.exec.apply(null, args);
    };
};

function createProxy (className, methodNames) {
    var proxy, i=0, max;
    if (!_.isArray(methodNames)) {
        proxy = methodNames; // methodNames is the object.
    } else {
        proxy = {};
        for (max=methodNames.length; i<max; i++) {
            var methodName = methodNames[i];    
            proxy[methodName] = createCallToNative(className, methodName);
        }
    }
    return proxy;
}
    
/**
 * This is a generic error handler.
 * 
 * It does its best to report a stack trace, or an error or *something*.
 * Unfortunately, some devices are better suported than others. 
 * e.g. Android >2.0, iOS 4.3 and iOS 6.0 are pretty good at providing errors (e.g. file location, stack trace etc)
 * iOS5 was shockingly bad.
 * 
 * @param during - what were you doing when you saw this error. This is a string.
 * @param e - the error itself. This, hopefully, is an Error object.
 */
function handleError(during, e) {
    /*
     *    {
            "message": "Can't find variable: cardObject",
            "line": 505,
            "sourceId": 250182872,
            "sourceURL": "file:///Users/james/Library/Application%20Support/iPhone%20Simulator/4.3.2/Applications/ADE774FF-B033-46A2-9CBA-DD362196E1F7/Moo.app/generated-javascript//src/controller/CardController.js",
            "expressionBeginOffset": 22187,
            "expressionCaretOffset": 22197,
            "expressionEndOffset": 22197
        }
     */
    console.error("-------------------------------------------------");
    console.error("Exception found " + during);
    console.error("Message: " + e.message);
    console.error("at     : " + e.line);
    var filename = e.sourceURL || "unknown";
    /*jshint regexp:false*/
    filename = filename.replace(/.*generated-javascript\//, "");
    /*jshint regexp:true*/
    console.error("file   : " + filename);
    console.error("url    : " + e.sourceURL);
    
    var stack = e.stack || e.stacktrace;

    if (stack) {
        console.error(stack);
    } else {
        console.log("No stack trace");
    }
}

/**
 * Finds the named module.
 * 
 * It tries quite hard to do this, looking at where gwtClasses may be stashed, and the browserify.require mechanism.
 * 
 * If the resulting object is a function, then it is assumed that the function is a constructor, and an object is newed.
 * 
 * Once we have an object to return, we keep it around as a cache. This is to preserve the require-like semantics, 
 * and also to allow multiple calls to the same object from native.
 * 
 * @param moduleName
 * @returns anObject.
 */
function resolveModule(moduleName) {
    if (loadedObjects[moduleName]) {
        return loadedObjects[moduleName];
    }
    var aModule, anObject, MyModule;
    if (gwtClasses) {
        aModule = gwtClasses[moduleName];
    }
    if (!aModule) {
        try {
            aModule = myRequire(moduleName);
        } catch (e) {
            // we don't need to do anymore, 
            // as require will have reported the problem
        }
    }
    
    if (aModule) {
        if (typeof aModule === 'function') {
            MyModule = aModule;
            anObject = new MyModule();
        } else {
            anObject = aModule;
        }
        loadedObjects[moduleName] = anObject;
        return anObject;
    }
    
    // we've tried require, and gwt modules.
    // require() will have reported the error already.
    //throw new Error("Cannot load module " + moduleName);
}
exports.resolveModule = native2js.resolveModule = resolveModule;

/**
 * This is the eventual recipient of the native kirinHelper.onLoad method, which is called from the bindScreen() methods.
 * 
 * This receives a module name, and a list of methods that a native method implements.
 * 
 * From the list of methods, a proxy object is constructed, complete with matching methods. On calling any of these 
 * methods, kirin will try hard to call the corresponding methods in native.
 * 
 * A module is found with the passed name, and if an <code>onLoad</code> method exists, then the proxy is passed to it.
 */
native2js.loadProxyForModule = function (moduleName, methodNames) {
    var proxy = createProxy(moduleName, methodNames);
    var module_;
    try {
        module_ = resolveModule(moduleName);
    } catch (e) {
        handleError("resolving module " + moduleName, e);
        return;
    }
    if (module_) {
        try {
            module_.onLoad(proxy);
        } catch (e1) {
            handleError("loading module " + moduleName, e1);
        }
    }
    
};

/**
 * A corresponding method to <code>loadProxyForModule()</code>
 */
native2js.unloadProxyForModule = function (moduleName) {
    try {
        var module_ = resolveModule(moduleName);
        // TODO unrequire
        // should we unrequire by removing it from the loadedObjects list. 
        // this will have most effect on things setting module.exports = MyClass, e.g. GWT
        module_.onUnload();    
    } catch (e) {
        handleError("unloading module", e);
    }
};

/**
 * Find the named module, check if there is a method with the correct name, then call it.
 */
native2js.execMethod = function (moduleName, methodName, argsList) {
    var module = resolveModule(moduleName);

    if (!module) {
        console.error("No such module " + moduleName);
        return;
    }

    if (typeof module[methodName] !== 'function') {
        console.warn("Module " + moduleName + " does not have a method " + methodName);
        return;
    }
        
    try {
        if (argsList) {
            module[methodName].apply(module, argsList);
        } else {
            module[methodName]();
        }
    } catch (e) {
        handleError("executing " + moduleName + "." + methodName, e);
    }
};

native2js.execCallback = function (callbackId, argsList) {
    var callback = callbacks[callbackId];
    if (!callback) {
        console.warn("Callback " + callbackId + " doesn't exist");
        return;
    }
    if (typeof callback !== 'function') {
        console.error("Problem calling callback '" + callbackId + "'");
        return;
    }
    
    try {
        if (argsList) {
            callback.apply(null, argsList);        
        } else {
            callback();
        }
    } catch (e) {
        handleError("calling callback " + callbackId + JSON.stringify(argsList), e);
    }
};

/* Once a callback has been finished with, then it should 
 * be removed from the Javascript context.
 * 
 * It will be up to the caller to delete the callbacks when 
 * they've finished with them
 * (difference b/w callback and listener).
 */
native2js.deleteCallback = function (args) {
    var i=0, max;
    for (max=args.length; i<max; i++) {
        delete callbacks[args[i]];
    }
};

/**
 * Let native see all these functions.
 *
 */
Native.exposeToNative("native2js", native2js);

/**
 * As a convenience, let javascript see them too.
 * It may turn out we don't need any of these functions.
 */
exports.native2js = native2js;

/**********************************************************************/
/* Expose the proxies to Javascript.
 **********************************************************************/

exports.wrapCallback = wrapCallback;
exports.wrapCallbacks = wrapCallbacks;
exports.exposeToNative = Native.exposeToNative;

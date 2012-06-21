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




var sys = require("util");

var testtools = global.testtools;
var kirinPath = testtools.createUnitTestingModulePath("kirin-core");

var Native = kirinPath.require("Native");
console.log("kirinPath is " + kirinPath);
var assert = require("assert");

var callee = Native.lastCall;


exports.testTestOverrideToValidateAllTests = function () {
    Native.exec("Test.exec", "We've successfully", "overridden", "Native");
    assert.equal(3, callee.args.length);
    assert.equal("Test.exec", callee.method);
}

var kirin = kirinPath.require("kirin");

exports.testSimpleWrapping = function () {
    kirin.native2js.registerProxy("CurrentScreen", ["foo", "bar", "baz"]);
    var currentScreen = kirin.proxy("CurrentScreen");
    assert.ok(typeof currentScreen !== 'undefined');
    
    currentScreen.foo("Calling out", "to native", "with a", 1);
    assert.equal("CurrentScreen.foo", callee.method);
    assert.equal(4, callee.args.length);
    
    assert.equal("function", typeof currentScreen.bar);
    assert.equal("function", typeof currentScreen.baz);
};

/*
var poop = (function() {
        var counter = 0;
        return function (jsName, methodName) {
            var prefix = (arguments.length >= 2) ?
                    jsName + methodName : "anon.";
            if (typeof prefix != 'string') prefix = "face.";
            return prefix + (counter ++);
        };
    })();

exports.testJS = function () {

    var nope = {};
    var a = poop(nope.imnot,nope.neitherami);
    assert.equal("CurrentScreenbar0", a);

} 
*/

exports.testCallbackReplacement = function () {
    kirin.native2js.registerProxy("CurrentScreen", ["foo", "bar", "baz"]);
    var currentScreen = kirin.proxy("CurrentScreen");
    currentScreen.bar("SELECT *", function (arg) {
        callee.callback.called = true;
        callee.callback.arg = arg;
        return "callback_result";
    });
    
    var token = callee.args[1];
    assert.equal("CurrentScreenbar0", token);
    assert.equal(2, callee.args.length);
    
    assert.ok(!callee.callback.called);
    var result = kirin.native2js.callCallback(token);
    
    assert.ok(callee.callback.called);
    assert.equal("callback_result", result);

    kirin.native2js.callCallback(token, "my_result");
    assert.equal("my_result", callee.callback.arg);


    kirin.native2js.deleteCallback(token);

    console.log("TEST: Expecting a problem to be reported...");    
    result = kirin.native2js.callCallback(token);
    assert.equal("undefined", typeof result);
};

// use DummyScreen as a dummy
var jsScreen = require('DummyScreen');
var methods = [
    "updateLabelSize_andText_",
    "changeScreen_"
];
    
kirin.native2js.registerScreenProxy("DummyScreen", methods);
kirin.native2js.setCurrentScreenProxy("DummyScreen");

var nativeScreen = kirin.js2nativeScreenProxy;
var lastCall = Native.lastCall;

exports.testNativeMethodsExist = function () {
    for (var i=0; i<methods.length; i++) {
        assert.equal("function", typeof nativeScreen[methods[i]]);
    }
};

exports.testJavascriptExposed = function () {
    var exposed = Native.EXPOSED_TO_NATIVE;
    assert.equal("object", typeof exposed);
    
    assert.equal(jsScreen, exposed.native2jsScreenProxy);    
};


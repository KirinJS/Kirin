"use strict";
var tap = require("tap"),
    test = tap.test,
    plan = tap.plan,
    _ = require("underscore");

var BridgeUtils = require("../../src/core/kirin-validation.js").BridgeUtils;

var simpleSchema = {
        "properties": {
            myString: "string",
            myInteger: "number", 
            myBoolean: "boolean",
            myData: "object",
            myArray: "array"
        },
        "methods": {
            foo: 1,
            bar: 2,
            baz: 3
        }
	};

test("Properties of the right type should not throw errors", function (t) {
	var validation = new BridgeUtils(simpleSchema);

    t.doesNotThrow(function () {validation.validate({myString: "string"})});
    t.doesNotThrow(function () {validation.validate({myInteger: 1})});
    t.doesNotThrow(function () {validation.validate({myBoolean: true})});
    t.doesNotThrow(function () {validation.validate({myData: {}})});
    t.doesNotThrow(function () {validation.validate({myArray: [1,2,3]})});
    
    t.end();
});

test("Properties not in the schema should not throw errors", function (t) {
	var validation = new BridgeUtils(simpleSchema);
    t.doesNotThrow(function () {validation.validate({myMadeUpProperty: [1,2,3]})});
    t.doesNotThrow(function () {validation.validate({myMadeUpFunction: function (x) {}})});
    t.end();
});

test("Properties of the wrong type should throw errors", function (t) {
	var validation = new BridgeUtils(simpleSchema);
    
    t.throws(function () { validation.validate({myString: 1})});
    t.throws(function () { validation.validate({myString: true})});
    t.throws(function () { validation.validate({myString: {}})});
    t.throws(function () { validation.validate({myString: []})});
    
    t.throws(function () { validation.validate({myInteger: "string"})});
    t.throws(function () { validation.validate({myInteger: true})});
    t.throws(function () { validation.validate({myInteger: {}})});
    t.throws(function () { validation.validate({myInteger: []})});
    
    t.throws(function () { validation.validate({myBoolean: "string"})});
    t.throws(function () { validation.validate({myBoolean: 0})});
    t.throws(function () { validation.validate({myBoolean: {}})});
    t.throws(function () { validation.validate({myBoolean: []})});
    
    t.throws(function () { validation.validate({myData: "string"})});
    t.throws(function () { validation.validate({myData: 0})});
    t.throws(function () { validation.validate({myData: false})});
    t.throws(function () { validation.validate({myData: []})});
    
    t.throws(function () { validation.validate({myArray: "string"})});
    t.throws(function () { validation.validate({myArray: 0})});
    t.throws(function () { validation.validate({myArray: false})});
    t.throws(function () { validation.validate({myArray: {}})});
    
    t.end();
});


test("Methods of the wrong arity should throw errors", function (t) {
	var validation = new BridgeUtils(simpleSchema);
    t.throws(function () {validation.validate({foo: function () {}})});
    t.throws(function () {validation.validate({bar: function (x) {}})});
    t.throws(function () {validation.validate({baz: function (x, y) {}})});
    
    t.throws(function () {validation.validate({foo: function (x, y) {}})});
    t.throws(function () {validation.validate({bar: function (x, y, z) {}})});
    t.throws(function () {validation.validate({baz: function (x, y, z, z1) {}})});
    
    t.end();
});


var complexSchema = {
        properties: {
            "twitterUsername": "string",
            "gmailUsername": "string",
            
            "password": "string",
            "service": "string"
        },

        dependencies: {
            // we must have a password, whatever
            "twitterUsername": ["password"],
            "gmailUsername": ["password"],
        },
        
        allowable: [
            ["service", "twitterUsername"],
            ["service", "gmailUsername"],
        ]
};



test("Allowable combinations don't throw errors", function (t) {
	var validation = new BridgeUtils(complexSchema);
    t.doesNotThrow(function () { validation.validate({"service": "s", "twitterUsername": "t", "password": "p"}) });
    t.doesNotThrow(function () { validation.validate({"service": "s", "gmailUsername": "g", "password": "p"}) });
    
    t.end();
});

test("Non-Allowable combinations do throw errors", function (t) {
	var validation = new BridgeUtils(complexSchema);
    t.throws(function () { validation.validate({"service": "s", "password": "p"}) });
    t.throws(function () { validation.validate({"service": "s", "password": "p"}) });
    
    t.end();
});
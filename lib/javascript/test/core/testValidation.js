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
            foo: ["arg"],
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

        mandatory: ["service"],
        
        allowable: [
            ["twitterUsername"],
            ["gmailUsername"],
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

test("Mandatory properties don't throw errors if present", function (t) {
    var validation = new BridgeUtils(complexSchema);
    t.doesNotThrow(function () { validation.validate({"service": "s", "twitterUsername": "t"})});
    t.end();
});

test("Mandatory properties do throw errors if not present", function (t) {
    var validation = new BridgeUtils(complexSchema);
    t.throws(function () { validation.validate({"twitterUsername": "t"})});
    t.throws(function () { validation.validate({"gmailUsername":"g"})});
    t.end();
});

var aSchemaWithMethods = {
        properties: {
            "foo": "string"
        },
        methods: {
            "aMethod": ["code", "message"]
        }
    },
    aSchemaWithoutMethods = {
        properties: {
            "foo": "string"
        }
    };


test("hasCallbacks detects callbacks ok, even if non-declared methods are present", function (t) {
    
    var objectWithMethod = {
            foo: "my string",
            aMethod: function () {}
        },
        objectWithoutMethod = {
            foo: "no method"
        },
        validation;
    
    validation = new BridgeUtils(aSchemaWithoutMethods);
    t.ok(!validation.hasCallbacks(objectWithMethod));
    t.ok(!validation.hasCallbacks(objectWithoutMethod));
    
    validation = new BridgeUtils(aSchemaWithMethods);
    t.ok(validation.hasCallbacks(objectWithMethod));
    t.ok(!validation.hasCallbacks(objectWithoutMethod));
    
    t.end();
});

test("createExportable has only the minimum of what is needed and no more", function (t) {
    
    var schema = {
            properties: {"foo":"string", "bar":"string"},
            methods: {"baz": ["x", "y"]}
        },
        validation = new BridgeUtils(schema);
    
    t.deepEqual({}, validation.createExportableObject({"extraProperty": "1"}));
    t.deepEqual({"foo": "1"}, validation.createExportableObject({"foo": "1"}));
    t.deepEqual({"foo": "1", "bar": "2"}, validation.createExportableObject({"foo": "1", "bar":"2"}));
    t.deepEqual({"foo": "1"}, validation.createExportableObject({"foo": "1", "extraProperty": 2}));

    t.deepEqual({"foo": "1", "bar": "2"}, validation.createExportableObject({"foo": "1", "bar": "2", "extraProperty": 2}));
    t.deepEqual({"foo": "1", "bar": "2"}, validation.createExportableObject({"foo": "1", "bar": "2", "extraMethod": function () {}}));

    // we can't export functions, so we replace them with true.
    var myFunction = new function () {};
    t.deepEqual({}, validation.createExportableObject({"extraMethod": myFunction}));
    t.deepEqual({"baz": true}, validation.createExportableObject({"baz": myFunction}));
    t.deepEqual({"baz": true}, validation.createExportableObject({"baz": myFunction, "extraMethod": myFunction}));

    t.deepEqual({"foo": "1", "bar": "2", "baz": true}, validation.createExportableObject({"foo": "1", "bar": "2", "baz": myFunction}));
    
    t.end();
});

test("fillInDefaults is filling in defaults from the schema", function (t) {
    
    // I'm not going to test this too hard.
    var schema = {
            properties: {
                "foo": "int",
                "bar": "int"
            },
    
            defaults: {
                "foo": 99,
                "bar": 99
            }
        },
        validation = new BridgeUtils(schema);
    
    t.deepEqual({"foo": 99, "bar": 99}, validation.fillInDefaults({}));
    
    t.deepEqual({"foo": 1, "bar": 99}, validation.fillInDefaults({"foo": 1}));    
    t.deepEqual({"foo": 0, "bar": 99}, validation.fillInDefaults({"foo": 0}));
    t.deepEqual({"foo": 99, "bar": 99}, validation.fillInDefaults({"foo": null}));
    
    t.end();
});

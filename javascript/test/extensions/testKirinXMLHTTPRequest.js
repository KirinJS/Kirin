"use strict";
var tap = require("tap"),
    test = tap.test,
    plan = tap.plan,
    _ = require("underscore");

var DummyBackend = function () {},
    backend = new DummyBackend();

var KirinXMLHTTPRequest = require("../../src/extensions/network/KirinXMLHTTPRequest");



_.extend(backend, {
    
    statusCode: 200,
    downloadString: "Test string",
    progressEvent: { total: 100, loaded: 50 },
    responseHeaders: {},
    
    synchronous: true,
    
    open: function (xhrObject, data) {
        var self = this;
        this.xhrObject = xhrObject;
        this.data = data;
        if (this.synchronous) {
            self.doDownload();
        } else {
            setTimeout(function () {
                self.doDownload();
            }, 1);
        }
    },
    
    doDownload: function () {
        var response = {
                "status": this.statusCode,
                "statusText": "OK"
        };
        this.xhrObject._doOnConnect(this.responseHeaders, this.progressEvent);
        this.xhrObject._doOnAppendPayload(this.downloadString, this.progressEvent);            
        this.xhrObject._doOnRequestComplete(this.statusCode, response, this.progressEvent);
    },
    
    abort: function (xhrId) {
        this.xhrId = xhrId;
    },
    
    reset: function () {
        this.synchronous = true;
        this.downloadString = "Test String";
        this.responseHeaders = {};
    }
});

var frontend = new KirinXMLHTTPRequest();
frontend.onLoad(backend);

var XMLHTTPRequest = frontend.XMLHTTPRequest;

test("Simple happy case. Download a string", function (t) {
    var request = new XMLHTTPRequest();
    
    request.open("GET", "http://example.com", true);
    
    t.equal(request.readyState, 1);
    
    request.send();
    t.equal(request.readyState, 4);
    
    t.equal(request.responseText, backend.downloadString);
    
    
    t.end();
    backend.reset();
});

test("Simple happy case. Download some json", function (t) {
    var remotePayload = {
            "foo": 1, 
            "bar": ["an", "array"],
            "baz": "a string",
            "quz": false
    };
    backend.downloadString = JSON.stringify(remotePayload);
    
    var request = new XMLHTTPRequest();
    request.responseType = "json";
    request.open("GET", "http://example.com", true);
    
    t.equal(request.readyState, 1);
    
    request.send();
    t.equal(request.readyState, 4);
    
    t.equal(backend.downloadString, request.responseText);
    
    console.dir(request);
    
    t.deepEqual(remotePayload, request.response);
    
    
    t.end();
    backend.reset();
});

test("Simple happy case. Download a string. Check in onload", function (t) {
    backend.synchronous = false;
    var request = new XMLHTTPRequest();
    
    request.open("GET", "http://example.com", true);
    t.equal(request.readyState, 1);
    
    request.onload = function () {
        t.equal(request.readyState, 4);
        t.equal(request.responseText, backend.downloadString);
        t.end();
    }
    
    request.send();
    
    backend.reset();
});


test("Simple happy case. Check in onreadystatechange", function (t) {
    var request = new XMLHTTPRequest();
    backend.synchronous = false;
    var newValue = 1,
        numTimesCalled = 0;
    request.onreadystatechange = function () {
        t.equal(newValue, request.readyState);
        numTimesCalled ++;
        newValue ++;
    };
    
    request.open("GET", "http://example.com", true);
    
    request.onload = function () {
        t.equal(numTimesCalled, 4);
        t.end();
    };
    request.send();
    
    backend.reset();
});

test("Upload listeners", function (t) {
    var request = new XMLHTTPRequest(),
        savedEvent;
    
    request.addEventListener("progress", function (event) {
        savedEvent = event;
    });
    
    // this is just to make sure we have prepared the request.
    request.open("GET", "http://example.com", true);
    request.send();
    
    t.ok(request._emitter);
    t.ok(request._doUploadProgress);
    
    var myEvent = {loaded : 5, total: 10};
    request._doUploadProgress("progress", myEvent);
    
    t.deepEqual(myEvent, savedEvent);
    
    t.end();
});

test("Upload listeners: lengthComputable", function (t) {
    var request = new XMLHTTPRequest(),
    savedEvent;

    request.addEventListener("progress", function (event) {
        savedEvent = event;
    });
    
    // this is just to make sure we have prepared the request.
    request.open("GET", "http://example.com", true);
    request.send();
    
    t.ok(request._emitter);
    t.ok(request._doUploadProgress);
    
    var myEvent = {loaded : 5, total: 10};
    request._doUploadProgress("progress", myEvent);
    t.ok(myEvent.lengthComputable);
    
    myEvent.loaded = -1;
    myEvent.total = 1;
    request._doUploadProgress("progress", myEvent);
    t.notOk(myEvent.lengthComputable);
    
    myEvent.loaded = 1;
    myEvent.total = 0;
    request._doUploadProgress("progress", myEvent);
    t.notOk(myEvent.lengthComputable);
    
    myEvent.loaded = 2;
    myEvent.total = 1;
    request._doUploadProgress("progress", myEvent);
    t.ok(myEvent.lengthComputable); // not sure what the spec says here.
    
    myEvent.loaded = 0;
    myEvent.total = 1;
    request._doUploadProgress("progress", myEvent);
    t.ok(myEvent.lengthComputable);
    
    t.end();
    backend.reset();
});

test("responseType", function (t) {
    
    var request = new XMLHTTPRequest(),
        myResponseType = "application/random";
    
    // "arraybuffer", "blob", "document", "json", and "text".
    
    request.responseType = myResponseType;
    
    request.open("GET", "http://example.com", true);
    request.send();
    
    var actualRequest = backend.xhrObject;
    t.equal(actualRequest.responseType, myResponseType);
    
    t.end();
});

test("requestHeaders", function (t) {
    
    var request = new XMLHTTPRequest();
    request.setRequestHeader("my-header", "a value");
    
    request.open("GET", "http://example.com", true);
    request.send();
    
    var actualRequest = backend.xhrObject;
    t.equal(actualRequest.requestHeaders["my-header"], "a value");
    
    t.end();
});

test("responseHeaders", function (t) {
    
    backend.responseHeaders = {
        "fake": "a value",
        "another": "a second value"
    };
    
    var request = new XMLHTTPRequest();

    request.open("GET", "http://example.com", true);
    request.send();
    
    t.deepEqual(request.responseHeaders, backend.responseHeaders);
    
    t.end();
    backend.reset();
});


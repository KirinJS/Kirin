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

var assert = require("assert"),
    net = require("device-networking-alpha"),
    kirin = require("kirin"),
    backend = kirin.proxy("Networking-backend");

var downloadTime = 1000;
var testWaitTime = downloadTime + 100;
var maxDownloadTimeIRL = 60 * 1000;

var testDownloadJSONWithFakeData = function (method, url, callback, errback) {
    var data = fakeFileObject;
    
    setTimeout(function () {
        if (data === "error") {
            errback("Deliberate error: " + method + " "+ url);
        } else {
            callback(JSON.stringify(data));
        }
        
    }, downloadTime);
};

var downloadError = null;

var fakeDownloadBinary = function (filename, url, headers, onSuccess, onError) {
    console.log("Downloading from " + url + " with " + JSON.stringify(headers));
    setTimeout(function () {
        if (downloadError) {
            onError(downloadError);
        } else {
            onSuccess();
        }
    }, downloadTime);
};

var fakeFileObject = {"list": [1, 2, 3]}; 

var originalDownloadJSONWithXMLHttpRequest = backend.replaceableDownloadJSON;

backend.replaceableSaveOffInternet = fakeDownloadBinary;
exports.setup = function () {
    downloadError = null;
    backend.replaceableDownloadJSON = testDownloadJSONWithFakeData;
    
};




var eachCall = "each;";
var envelopeCall = "envelope;";
var finishCall = "finish;";
var errorCall = "error;";
var payloadCall = "payload;";

exports.testFakeDownload_ListInASmallFile = function () {
    var callLog = "";
    var total = "";
    var numItemsOnFinish = 0;
    fakeFileObject = {"path": {"to": {"list": [1, 2, 3]}}};
    var expectedList = fakeFileObject.path.to.list;
    net.downloadJSONList({
        url: "http://example.com/list",
        path: ["path", "to", "list"],
        each: function (obj) {
            callLog += eachCall;
            assert.ok(_.isNumber(obj));
            total += obj;
        },
        
        envelope: function (obj) {
            callLog += envelopeCall;
            assert.ok(!_.isUndefined(obj.path.to));
            assert.ok(_.isUndefined(obj.path.to.list));
        },
        
        onFinish: function (numItems) {
            callLog += finishCall;
            numItemsOnFinish = numItems;
        }
    });
    
    setTimeout(function () {
        assert.equal(envelopeCall + eachCall + eachCall + eachCall + finishCall, callLog);
        assert.equal("123", total);
        assert.equal(expectedList.length, numItemsOnFinish);
        
    }, testWaitTime);
};

exports.testFakeDownload_SinglePayload = function () {
    var callLog = "";
    fakeFileObject = {"path": {"to": {"list": [1, 2, 3]}}};
    
    net.downloadJSON({
        url: "http://example.com",
        method: "GET",
        payload: function (obj) {
            assert.ok(!_.isUndefined(obj.path.to));
            assert.ok(_.isArray(obj.path.to.list));
            
            callLog += payloadCall;
        },
        onError: function (err) {
            callLog += errorCall;
            assert.fail("Download shouldn't fail");
        }
    });
    
    setTimeout(function () {
        assert.equal(payloadCall, callLog);
    }, testWaitTime);
};

exports.testFakeDownloadBinary_SinglePayload = function () {
    var str = "";
    var callback = function (a, test) {
        return function () {
            str += a;
            if (test) {
                assert.strictEqual(test, str);
            }
        };
    };
    
    net.downloadFileToDisk({
        url: "http://www.example.com/favicon.ico",
        filename: "myFavicon.ico",
        headers: {"User-Agent": "TestyTesty"},
        onFinish: callback("A", "A")
    });
    net.downloadFileToDisk({
        url: "http://www.example.com/favicon.ico",
        filename: "myFavicon.ico",
        headers: {"User-Agent": "TestyTesty"},
        onFinish: callback("B", "AB")
    });
    net.downloadFileToDisk({
        url: "http://www.example.com/favicon.ico",
        filename: "myFavicon.ico",
        headers: {"User-Agent": "TestyTesty"},
        onFinish: callback("C", "ABC")
    });
};



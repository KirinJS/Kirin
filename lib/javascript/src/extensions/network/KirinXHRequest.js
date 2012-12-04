var _ = require('underscore'),
    kirinBridge = require('kirin-bridge-utils');

function KirinXHRequest (params) {
    if (typeof params === 'object') {
        _.extend(this, params);
    }
}

var instance = KirinXHRequest.prototype;
module.exports = KirinXHRequest;

instance.kirin_bridgeUtils = new kirinBridge.BridgeUtils({
    "properties": {
        "__id": "string",
        "url": "string",
        "method": "string",
        "timeout": "long",
        "responseType": "string",
        "requestHeaders": "object"
    },
    "methods": {
        "_doOnInitialisationError": [
            "errorMessage"
        ],
        "_doOnConnect": [
            "responseHeaders",
            "event"
        ],
        "_doOnAppendPayload": [
            "text",
            "event"
        ],
        "_doOnRequestComplete": [
            "statusCode",
            "response",
            "event"
        ],
        "_doOnInterrupt": [
            "errorMessage"
        ],
        "_doUploadProgress": [
            "eventType",
            "event"
        ]
    },
    "defaults": {
        "timeout": "0"
    }
}, false);
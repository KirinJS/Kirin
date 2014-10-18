var _ = require('underscore'),
    kirinBridge = require('kirin-bridge-utils');

function KirinCallback (params) {
    if (typeof params === 'object') {
        _.extend(this, params);
    }
}

var instance = KirinCallback.prototype;
module.exports = KirinCallback;

instance.kirin_bridgeUtils = new kirinBridge.BridgeUtils({
    "methods": {
        "callback": [
            "payload"
        ],
        "errback": [
            "errorCode",
            "errorMessage"
        ]
    },
    "mandatory": [
        "callback"
    ]
}, false);
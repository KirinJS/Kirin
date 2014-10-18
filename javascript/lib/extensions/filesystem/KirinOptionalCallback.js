var _ = require('underscore'),
    kirinBridge = require('kirin-bridge-utils');

function KirinOptionalCallback (params) {
    if (typeof params === 'object') {
        _.extend(this, params);
    }
}

var instance = KirinOptionalCallback.prototype;
module.exports = KirinOptionalCallback;

instance.kirin_bridgeUtils = new kirinBridge.BridgeUtils({
    "methods": {
        "callback": [
            "payload"
        ],
        "errback": [
            "errorCode",
            "errorMessage"
        ]
    }
}, false);
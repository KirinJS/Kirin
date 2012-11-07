var _ = require('underscore'),
    kirinBridge = require('kirin-bridge-utils');

function KirinPreferenceListener (params) {
    if (typeof params === 'object') {
        _.extend(this, params);
    }
}

var instance = KirinPreferenceListener.prototype;
module.exports = KirinPreferenceListener;

instance.kirin_bridgeUtils = new kirinBridge.BridgeUtils({
    "methods": {
        "onPreferenceChange": [
            "preferenceKey",
            "newValue"
        ],
        "onListeningEnding": []
    },
    "mandatory": [
        "onPreferenceChange",
        "onListeningEnding"
    ]
}, false);
var _ = require('underscore'),
    kirinBridge = require('kirin-bridge-utils');

function KirinLocationListener (params) {
    if (typeof params === 'object') {
        _.extend(this, params);
    }
}

var instance = KirinLocationListener.prototype;
module.exports = KirinLocationListener;

instance.kirin_bridgeUtils = new kirinBridge.BridgeUtils({
    "properties": {
        "minimumDistanceDelta": "float",
        "minimumTimeDelta": "float"
    },
    "methods": {
        "locationUpdate": [
            "location"
        ],
        "locationError": [
            "errorMessage"
        ],
        "locationUpdateEnding": [],
        "updatePermissions": [
            "permissions"
        ]
    },
    "mandatory": [
        "locationUpdate",
        "locationError",
        "locationUpdateEnding"
    ],
    "allowable": [
        [
            "minimumTimeDelta"
        ],
        [
            "minimumDistanceDelta"
        ]
    ]
}, false);
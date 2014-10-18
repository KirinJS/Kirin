var _ = require('underscore'),
    kirinBridge = require('kirin-bridge-utils');

function DemoLocationListener (params) {
    if (typeof params === 'object') {
        _.extend(this, params);
    }
}

var instance = DemoLocationListener.prototype;
module.exports = DemoLocationListener;

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
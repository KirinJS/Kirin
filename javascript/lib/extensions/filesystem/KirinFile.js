var _ = require('underscore'),
    kirinBridge = require('kirin-bridge-utils');

function KirinFile (params) {
    if (typeof params === 'object') {
        _.extend(this, params);
    }
}

var instance = KirinFile.prototype;
module.exports = KirinFile;

instance.kirin_bridgeUtils = new kirinBridge.BridgeUtils({
    "properties": {
        "name": "string",
        "type": "string",
        "size": "long",
        "fileArea": "string"
    },
    "methods": {
        "_append": [
            "text"
        ]
    },
    "mandatory": [
        "name",
        "type",
        "size"
    ]
}, false);
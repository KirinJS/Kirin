module.exports = {
    namespace: "com.futureplatforms.kirin.generated.location",
    location: "extensions/location",
    classes: {
        "KirinLocationBackend": {
            docs: "This is the backend of the location extension. This is implemented in native code, and talks to the js and the device.",
            declaredBy: "native",
            methods: {
                // only methods allowed
                "startWithLocationListener": [{ listener : "KirinLocationListener" }],
                "stopLocationListener": [], 
                "forceRefresh": [],
                "getPermissions": []
            }
        },
        "KirinLocation": {
            docs: "This is or represents the Javascript module that will communicate with native",
            declaredBy: "javascript", // || gwt
            
            methods: {
                "setLastLocation": [{"location": "KirinLocationData" }]
            }
        },
        
        "KirinLocationListener": {
            docs: "This is originates in Javascript, but is passed to native. Calling methods from native will call the corresponding js method",
            role: "request",
            properties: {
                // we should probably do something about accuracy
                "minimumDistanceDelta": "float",
                "minimumTimeDelta": "float"
            },
            
            methods: {
                "locationUpdate": [{"location": "KirinLocationData"}],
                "locationError": [{"errorMessage": "string"}],
                "locationUpdateEnding": [],
                "updatePermissions": [{"permissions": "KirinLocationPermissions"}]
            },
            
            validation: {
                mandatory: ["locationUpdate", "locationError", "locationUpdateEnding"],
                acceptableForms: [
                     ["minimumTimeDelta"],
                     ["minimumDistanceDelta"]
                ]
            }
        },
        
        "KirinLocationData": {
            docs: "This is a Location data object. It is produced by the device, and then passed into the Javascript.",
            role: "response",
            properties: {
                "latitude": "double",
                "longitude": "double",
                "timestamp": "double",
                "horizontalAccuracy": "double"
            }
        },
        
        "KirinLocationPermissions": {
            role: "response",
            properties: {
                "authorized": "boolean"
            }
        }
        
    }
};
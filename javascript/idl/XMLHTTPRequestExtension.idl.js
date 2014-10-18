module.exports = {
    namespace: "com.futureplatforms.kirin.generated.xhr",
    location: "extensions/network",
    classes: {
        "KirinXHRExtension": {
            docs: "This module reimplements the bare minimum that native " +
            		"needs to drive an implementation of XMLHTTPRequests, adding " +
            		"resiliance to " +
            		"interrupt events such as loss of network connectivity, " +
            		"application backgrounding and perhaps even reboot.",
            implementedBy: "native",
            methods: {
                "open": [{"xhrObject":"KirinXHRequest"}, {"data":"any"}],
                "abort": [{"xhrId":"string"}]
            }
        },
        
        "KirinXMLHTTPRequest": {
            docs: "This module is actually replaces the window.XHR with " +
            		"one connected to native. The native implementation " +
            		"should provide resiliance to interrupts.",
            implementedBy: "javascript",
            methods: {
                "onConnectivityStateChange": [{"newState" : "string" }]
            }
        },
        
        "KirinXHRequest": {
            docs: "This is constructed by the new XMLHTTPRequest, to be passed to " +
            		"native. The methods should provide enough for a good experience with the XHR",
            role: "request",
            
            methods: {
                _doOnInitialisationError: [{"errorMessage": "string"}],
                _doOnConnect: [{"responseHeaders": "object"}, {"event":"KirinXHRProgressEvent"}],
                _doOnAppendPayload: [{"text":"string"}, {"event":"KirinXHRProgressEvent"}],
                _doOnRequestComplete:[{"statusCode":"integer"}, 
                                      {"response":"KirinXHRResponse"}, 
                                      {"event":"KirinXHRProgressEvent"}],
                _doOnInterrupt: [{"errorMessage": "string"}],
                _doUploadProgress:[{"eventType":"string"}, {"event":"KirinXHRProgressEvent"}]
            },
            
            properties: {
                "__id": "string",
                "url": "string",
                "method": "string",
                "timeout": "long",
                "responseType": "string",
                "requestHeaders": "object"
            },
            
            validation: {
                mandatory: [],
                defaults: {
                    "timeout": "0"
                }
            }
        },
        
        "KirinXHRProgressEvent": {
            role: "response",
            properties: {
                "loaded":"integer",
                "total":"integer" // we should add lengthComputable
            }
        },
        
        "KirinXHRResponse": {
            role: "response",
            properties: {
                "status": "integer",
                "statusText": "string"
            }
        }
        
    }
};
module.exports = {
    namespace: "com.futureplatforms.kirin.generated.fs",
    location: "extensions/filesystem",
    classes: {
        "KirinFilesystemExtension": {
            docs: "This module reimplements the bare minimum that native " +
            		"needs to drive an implementation of XMLHTTPRequests, adding " +
            		"resiliance to " +
            		"interrupt events such as loss of network connectivity, " +
            		"application backgrounding and perhaps even reboot.",
            implementedBy: "native",
            methods: {
                readString:[ {"file":"KirinFile"}, {javascriptListener:"KirinCallback"}],
                readJson:[ {"file":"KirinFile"}, {javascriptListener:"KirinCallback"} ],
                writeString:[ {"file":"KirinFile"}, {contents: "string"}, {javascriptListener:"KirinOptionalCallback"} ],
                copy:[ {"src":"KirinFile"}, {javascriptListener:"KirinOptionalCallback"} ],
                list:[ {"fileOrDir":"KirinFile"}, {javascriptListener:"KirinCallback"} ],
                remove:[ {"fileOrDir":"KirinFile"}, {javascriptListener:"KirinOptionalCallback"} ],
            }
        },
        
        "KirinCallback": {
            role: "request",
            methods: {
                callback: [ {payload: "any"} ],
                errback : [ {errorCode: "integer"}, {errorMessage: "string"}]
            },
            validation: {
                mandatory: ["callback"]
            }
        },
        
        "KirinOptionalCallback": {
            role: "request",
            methods: {
                callback: [ {payload: "any"} ],
                errback : [ {errorCode: "integer"}, {errorMessage: "string"}]
            },
            validation: {
                mandatory: []
            }
        },
        
        "KirinFile": {
            role: "request", // unsure of the role here.
            properties: {
                name:"string", // full path, or file suffix if fileArea is present
                type:"string", // mime type
                size:"long", // in bytes

                // optional
                fileArea: "string" // external|internal|application. external is mapped to internal for iOS.
            },
            
            methods: {
                _append: [{text:"string"}]
            },
            
            validation: {
                mandatory:["name", "type", "size"]
            }
        },
        
        
        "KirinFoundFile": {
            docs: "Used by the list() method",
            role: "response",
                properties: {
                    name:"string", // full path
                    type:"string", // mime type
                    size:"long", // in bytes
                },
                
                validation: {
                    mandatory:["name", "type", "size"]
                }
        },
        
        "KirinFilesystem": {
            
            docs: "This module is actually replaces the window.XHR with " +
            		"one connected to native. The native implementation " +
            		"should provide resiliance to interrupts.",
            implementedBy: "javascript",
            exports: {
                readString:[ {"file":"KirinFile"}, {"callback":"any"}, {"errback":"any"} ],
                readJson:[ {"file":"KirinFile"}, {"callback":"any"}, {"errback":"any"} ],
                writeString:[ {"file":"KirinFile"}, {"callback":"any"}, {"errback":"any"} ],
                copy:[ {"src":"KirinFile"}, {"dest":"KirinFile"}, {"callback":"any"}, {"errback":"any"} ],
                list:[ {"fileOrDir":"KirinFile"}, {"callback":"any"}, {"errback":"any"} ],
                remove:[ {"fileOrDir":"KirinFile"}, {"callback":"any"}, {"errback":"any"} ]
            },
            methods: {
            }
        }
        
    }
};
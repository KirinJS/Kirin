module.exports = {
    namespace: "xXcontextPackageXx.xXshortNameXx",
    classes: {
        "__ModuleProtocol__": {
            implementedBy: "javascript",
            namespace: ".shared",
            methods: {
                "setItem:Name:": [{id:"integer"}, {name:"string"}],
                "onItemTapped:": [{id:"integer"}]
            }
        },
        
        "__ScreenProtocol__": {
            implementedBy: "native",
            namespace: ".android",
            methods: {
                "setDataForScreen": [{data:"__RequestProtocol__"}]
            }
        },
        
        "__RequestProtocol__": {
            namespace: ".shared.requests",
            role: "request",
            properties: {
                name: "string"
            }
        }
    }
};

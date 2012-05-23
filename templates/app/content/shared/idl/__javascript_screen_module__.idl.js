module.exports = {
        namespace: "xXcontextPackageXx.xXshortNameXx",
        classes: {
            "__native_screen_module__": {
                namespace: ".shared",
                implementedBy: "javascript",
                methods: {
                    addNewItem: [],
                    itemSelected: [{index:"integer"}]
                }
            },
            "__native_screen__": {
                namespace: ".android",
                implementedBy: "native",
                methods: {
                    setTableContents: [{rows:"array"}], // of strings
                    "insertRow:WithContents:": [{index:"integer"}, {row:"string"}],
                    "displayDetailScreenForRow:AndContents:": [{index:"integer"}, {contents:"string"}]
                }
            }
        }
};
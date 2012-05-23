module.exports = {
    namespace: "com.futureplatforms.kirin.demo.hellokirin.ffi",
    classes: {
        "IDumbButtonScreen": {
            implementedBy: "native",
            methods: { 
                // only methods allowed
                "updateLabelSize:andText:": [{ size : "integer" }, { text : "string" }],
                "changeScreen:": [{ finalLabel: "string" }]
            }
        },
        "IDumbButtonScreenModule": {
            implementedBy: "javascript", // || gwt
            methods: {
                "onDumbButtonClick": [],
                "onNextScreenButtonClick": []
            }
        },
        
        
        "IDumbListScreen": {
            docs: "This screen looks after a list",
            implementedBy: "native",
            methods: { 
                // only methods allowed
                "populateList": [{ list : "array" }],
                "showToast": [{ toast: "string" }],
            }
        },
        "IDumbListScreenModule": {
            implementedBy: "javascript", // || gwt
            methods: {
                "onListItemClick": [{index: "int"}, {label: "string"}]
            }
        }

        
        
    }
};
module.exports = {
    namespace: "com.futureplatforms.kirin.generated.preferences",
    location: "extensions/preferences",
    classes: {
        "KirinPreferencesBackend": {
            docs: "Called in response to a settings.commit()",
            implementedBy: "native",
            methods: {
                // this is how Javascript will tell native to commit any changes made back to the backing store.
                "updateStoreWithChanges:andDeletes:": [{changes: "object"}, {deletes: "array"}],

                "addPreferenceListener":[{"listener":"KirinPreferenceListener"}],
                "removePreferenceListener": [],
                
                "addInterestFor": [{"preferenceName":"string"}],
                "removeInterestFor": [{"preferenceName":"string"}]
            }
        },
        "KirinPreferences": {
            docs: "mergeOrOverwrite and resetEnviroment is called at onLoad() time",
            implementedBy: "javascript", // || gwt
            methods: {
                "mergeOrOverwrite": [{"latestNativePreferences" : "object"}],
                "resetEnvironment": []
                
            }
        },
        
        "KirinPreferenceListener": {
            docs: "This is originates in Javascript, but is passed to native. Calling methods from native will call the corresponding js method",
            role: "request",
            
            methods: {
                "onPreferenceChange": [{"preferenceKey": "string"}, {"newValue": "any"}],
                "onListeningEnding": []
            },
            
            validation: {
                mandatory: ["onPreferenceChange", "onListeningEnding"],
            }
        }
        
    }
};
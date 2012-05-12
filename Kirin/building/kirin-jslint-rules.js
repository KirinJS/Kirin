exports.jslintConfig = {
//        predef:   [ // CommonJS
//                    "exports", 
//                    // YUI
//                    "YUI",
//                    "YAHOO",
//                    "YAHOO_config",
//                    "YUI_config",
//                    "Y",
//                    // NodeJS
//                    "GLOBAL",
//                    "process",
//                    "require",
//                    "__filename",
//                    "module"       ]
        undef: true, newcap: true, bitwise: false, "continue": true, maxerr: 50, indent: 4, white: false,
        predef: [ "console", 
        		  "defineModule", "defineServiceModule", "defineScreenModule", "defineUiFragmentModule", 
        		  "_",
                  "openDatabaseSync", "XMLHttpRequest", "JavaProxyObject",
                  "Qt", "window", "document", "$" // occassionally
                 ]
};

exports.jslintToleratedReasons = [
	"Cannot set property 'first' of undefined",
	"Mixed spaces and tabs."
];
defineModule("MasterModule", function (require, exports) {

    var theScreen = null;
    
    var sentence = "The quick brown fox jumped over the lazy dog";
    
    var items = sentence.split(/\s+/);
    
    exports.onLoad = function (ui) {
        theScreen = ui;
    };
    
    exports.onUnload = function () {
        theScreen = null;
    };

    exports.onResume = function () {
        // the screen is about to appear.
        theScreen.setTableContents(["click on add"]);
    };
    
    exports.onPause = function () {
        // the screen is about to go away.
    };

    exports.addNewItem = function () {
        console.log("Item added");
    };

    exports.itemSelected = function (row) {
        console.log("Item selected");
        
    };

});
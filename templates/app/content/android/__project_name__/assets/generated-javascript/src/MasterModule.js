defineModule("MasterModule", function (require, exports) {

    var theScreen = null;
    
    var sentence = "All work and no play makes __USER__ a dull boy";
    
    var items = sentence.split(/\s+/);
    
    var index = 0;
    
    exports.onLoad = function (ui) {
        theScreen = ui;
    };
    
    exports.onUnload = function () {
        theScreen = null;
    };

    exports.onResume = function () {
        // the screen is about to appear.
        theScreen.setTableContents(["click on add"]);
        index = 0;
    };
    
    exports.onPause = function () {
        // the screen is about to go away.
    };

    exports.addNewItem = function () {
        theScreen.insertRowWithContents(index, items[index]);
        index = (index + 1) % items.length; 
    };

    exports.itemSelected = function (row) {
        theScreen.displayDetailScreenForRowAndContents(row, items[row]);
    };

});
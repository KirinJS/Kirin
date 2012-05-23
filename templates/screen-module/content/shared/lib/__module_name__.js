/**
 * This Javascript will be called by native. 
 * 
 * Kirin will load the module, and construct an instance and 
 * pass an instance of __screen_interface__ in onLoad()
 */


function __ModuleName__ () {
    this.screen = null;
}
    
__ModuleName__.prototype.onLoad = function (ui) {
    // ui is an instance of __screen_interface__.java, 
    // or __ScreenProtocol__.h
    this.screen = ui;
};
    
__ModuleName__.prototype.onUnload = function () {
    this.screen = null;
};

__ModuleName__.prototype.onResume = function () {
    // the screen is about to appear.
    this.screen.setDataForScreen({name: "__ModuleName__"});
};

__ModuleName__.prototype.onPause = function () {
    // the screen is about to go away.
};

__ModuleName__.prototype.setItemName = function (id, name) {
    
};
    
__ModuleName__.prototype.onItemTapped = function (id) {
    
};

var module = { exports: {} };

%INCLUDED_SCRIPTS%

require("kirin");
var _ = module.exports._;

require("Settings-backend");
require("Databases-backend");
require("Networking-backend");
require("Facebook-backend");

var stringUtils = require("StringUtils");
var settings;

var onLoadCompleted = function () {
	settings = require("Settings");
	settings.initializeSettings();
	require("Environment");
	require("LocalNotifications-backend");

	var kirin = require("kirin");
	kirin.native2js.initializeApplicationLifecycle();
	
};


console.log("QT javascript loaded");


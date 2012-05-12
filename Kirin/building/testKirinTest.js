var assert = require("assert");
var util = require("util");
var testTools;



exports.setup = function () {
	testTools = require("./kirin-testtools.js");
	assert.ok(testTools);
	testTools.reset();
}

exports.testAddModule = function () {	
	var moduleList = [
		"./foo/Kirin-ios.js",
		"./foo/Kirin-dummy.js",
		"./bar/Kirin-integration.js",
		"./core/defineModule-dummy.js",
		"./core/kirin-helper-dummy.js"
	];
	
	var moduleInfo = testTools.addPlugin("Kirin", moduleList);
	
	assert.equal("./foo/Kirin-dummy.js", moduleInfo.dummy.Kirin);
	assert.equal("./core/defineModule-dummy.js", moduleInfo.dummy.defineModule);	
	assert.equal("./bar/Kirin-integration.js", moduleInfo.integration.Kirin);
	assert.equal("./core/kirin-helper-dummy.js", moduleInfo.dummy['kirin-helper']);
};

exports.testCreateEmptyModulePath = function () {
	var path = require("path");
	var modulePath = testTools.createEmptyModulePath();

	assert.ok(modulePath);
	assert.ok(modulePath.require);
	

	modulePath.addModule("NodeModule", __filename);
	assert.equal(__filename, modulePath.getModuleFilename("NodeModule"));
	// require can use real node modules.
	var m = modulePath.require("NodeModule");
	assert.strictEqual(m, exports);



	modulePath.addModule("KirinModule", path.join(__dirname, "KirinModule-dummy.js"));
	// but can also use modules with defineModules.
	m = modulePath.require("KirinModule");

	// defined in the module itself.
	assert.equal("KirinModule-dummy", m.name);
	
};

exports.testCreateUnitTestModulePath = function () {
	var moduleList = [
		"./foo-ios.js",
		"./foo-dummy.js",
		"./foo-integration.js",
		"./bar-dummy.js",
		"./bar-ios.js",
		"./baz-ios.js"
	];
	
	var moduleInfo = testTools.addPlugin("foo-bar", moduleList);
	
	var modulePath = testTools.createUnitTestingModulePath("foo-bar");
	
	assert.equal("./foo-dummy.js", modulePath.getModuleFilename("foo"));
	assert.equal("./bar-dummy.js", modulePath.getModuleFilename("bar"));	
	assert.equal("./baz-ios.js",   modulePath.getModuleFilename("baz"));	
	
}

exports.testCreateIntegrationModulePath = function () {
	var moduleList = [
		"./foo-ios.js",
		"./foo-dummy.js",
		"./foo-integration.js",
		"./bar-dummy.js",
		"./bar-ios.js",
		"./baz-ios.js"
	];
	
	var moduleInfo = testTools.addPlugin("foo-bar", moduleList);
	
	var modulePath = testTools.createIntegrationModulePath("foo-bar");
	
	assert.equal("./foo-integration.js", modulePath.getModuleFilename("foo"));
	assert.equal("./bar-ios.js", modulePath.getModuleFilename("bar"));	
	assert.equal("./baz-ios.js",   modulePath.getModuleFilename("baz"));		
}






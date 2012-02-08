/*
   Copyright 2011 Future Platforms

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

var assert = require("assert"),
	kirin = require("kirin"),
	net_backend = kirin.proxy("Networking-backend"),
	proxo = require("Proxocube"),
	bakedInData = require("proxocube-dummy-data"),
	databases = require("Databases"),
	db_backend = kirin.proxy("Databases-backend"); 

var nativeOpenDatabaseCalled;
var nativeSyncExecSqlCalled;

db_backend.replaceableOpenDatabase = (function () {
	return function (filename, version) {
	
		//console.log("Native: openDatabase('" + filename + "', " + version + ")");
		nativeOpenDatabaseCalled += 1;
		return filename + "." + version;
	};
})();
var resultsLength = 1;
db_backend.replaceableSyncExecSql = function (db, sql, params) {
	nativeSyncExecSqlCalled += 1;
	if (sql === "error") {
		throw "Deliberate error thrown by the database";
	}
	return {
		rows : {
			length : resultsLength,
			item: function (i) { return i;} 
		}
	};
};
proxo.replaceableSetTimeout = setTimeout;

var fakeFileObject;
var downloadTime = 1000;
var testWaitTime = downloadTime + 100;
var dummyDownloadJSONWithFakeData = function (method, url, callback, errback) {
	var data = fakeFileObject;
	
	setTimeout(function () {
		//console.log(sys.inspect(fakeFileObject));
		if (data === "error") {
			errback("Deliberate error: " + method + " "+ url);
		} else {
			callback(data)
		}
		
	}, downloadTime);
};

var originalDownloadJSONWithXMLHttpRequest = net_backend.replaceableDownloadJSON;
var config, db_config;



exports.setup = function () {
	net_backend.replaceableDownloadJSON = dummyDownloadJSONWithFakeData;

	
	
	db_config = {
		onCreate: function (tx) {},
		filename: "test.db",
		version: 1
	};
	
	config = {
		urlSuffix: "lineup",
	
		additionCount: 0,
		deletionCount: 0,
		syncCompleteCount: 0,
		
		onInsertOrUpdate: function (tx, item) {
			this.additionCount ++;
			assert.ok(_.isFunction(tx.execStatement));
		},
		onDelete: function (tx, item) {
			this.deletionCount ++;
			assert.ok(_.isFunction(tx.execStatement));
		},
		onSyncCompleting: function (tx, previousRevision, currentRevision) {
			assert.ok(currentRevision >= previousRevision);
			assert.equal(8, this.additionCount + this.deletionCount);
			assert.ok(_.isFunction(tx.execStatement));
			assert.ok(!tx.isStale);
			this.syncCompleteCount ++;
		},
		onError: function (err) {
			console.log(err);
		}
	};
	
	fakeFileObject = _.clone(bakedInData.sample_proxocube_output()); 
	
};

exports.testProxocube_Configuration = function () {
	var proxocube = proxo.createProxocubeClient(config);
	
	assert.ok(!_.isUndefined(proxocube));
	assert.ok(!_.isNull(proxocube));
	
	assert.ok(_.isFunction(proxocube.sync));
	assert.ok(_.isFunction(proxocube.onDelete));
	assert.ok(_.isFunction(proxocube.onInsertOrUpdate));
	assert.ok(_.isFunction(proxocube.onSyncComplete));
	
	assert.equal("lineup", proxocube.urlSuffix);
	assert.ok(proxocube.urlPrefix);
	assert.ok(_.isString(proxocube.urlPrefix));
	assert.ok(proxocube.urlPrefix.length > 0);
	
	assert.equal(proxocube.urlHostname + proxocube.urlPrefix + "lineup", proxocube.url);
};

exports.testProxocube_InitialSync = function () {
	_.each(fakeFileObject, function (item) {
		item.deleted = false;
		item.revision = 2;
	});

	var proxocube = proxo.createProxocubeClient(config);
	var db = databases.openDatabase(db_config);
	
	assert.equal(-1, proxocube.revision);
	
	proxocube.sync(db);
	
	setTimeout(function () {
		assert.equal(8, proxocube.additionCount);
		assert.equal(0, proxocube.deletionCount);
		assert.equal(1, proxocube.syncCompleteCount);
		assert.equal(2, proxocube.revision);
	}, testWaitTime);
	
};

exports.testProxocube_SyncWithDeletions = function () {
	_.each(fakeFileObject, function (item) {
		item.deleted = true;
		item.revision = 4;
	});
	
	var proxocube = proxo.createProxocubeClient(config);
	var db = databases.openDatabase(db_config);
	
	assert.equal(-1, proxocube.revision);
	
	proxocube.sync(db);
	
	setTimeout(function () {
		assert.equal(0, proxocube.additionCount);
		assert.equal(8, proxocube.deletionCount);
		assert.equal(1, proxocube.syncCompleteCount);
		assert.equal(4, proxocube.revision);
	}, testWaitTime);
	
};

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

var databases = require("app-databases-alpha"),
	assert = require("assert"),
	kirin = require("kirin"),
	backend = kirin.proxy("Databases-backend"); 

var config;
var nativeOpenDatabaseCalled;
var nativeSyncExecSqlCalled;

backend.replaceableOpenDatabase = (function () {
	return function (filename, version) {
	
		//console.log("Native: openDatabase('" + filename + "', " + version + ")");
		nativeOpenDatabaseCalled += 1;
		return filename + "." + version;
	};
})();

backend.replaceableTransaction = function (db, txBody, tx) {
	(function () {
		var err = txBody(tx);
		if (err) {
			throw err;
		}
	})();
};

var resultsLength = 1;
backend.replaceableSyncExecSql = function (db, sql, params) {
	nativeSyncExecSqlCalled += 1;
	// console.log("Native: " + db + ".execSQL('" + sql + ")'");
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

var fileLoadTime = 1000;
var testWaitTime = fileLoadTime + 100;
var fakeFileData = "statement1; statement2;"
backend.replaceableLoadStaticFile = function (filename, callback, errback) {
	var data = fakeFileData;
	setTimeout(function () {	
		callback(data);
	}, fileLoadTime);
};


exports.setup = (function () {
	var dbNum = 1;
	return function () {
	
		config = {
			filename: "test."+ dbNum + ".db",
			version: 1,
			
			onCreate: function (tx) {
	
			}
		};
		dbNum ++;
		backend.version = undefined;
		nativeOpenDatabaseCalled = 0;
		nativeSyncExecSqlCalled = 0; 
	};
})();


exports.testOpeningShouldRunCreateOrUpdate = function () {
	var created = false, updated = false;

	backend.version = undefined;

	config = {
		filename: "test.db",
		version: 1,
		
		onCreate: function (tx) {
			created = true;
		},
		
		onUpdate: function (tx, prevVersion, newVersion) {
			updated = true;
			assert.ok(!_.isUndefined(prevVersion));
			assert.ok(!_.isUndefined(newVersion));
			assert.ok(newVersion > prevVersion);
		}
	};
	
	var db = databases.openDatabase(config);
	
	assert.equal("test.db", db.name);
	assert.equal(1, db.version);
	assert.equal(1, nativeOpenDatabaseCalled);
	assert.ok(created);
	assert.ok(!updated);

	// redundant setting of version.
	backend.version = 1;
	config.version = 2;
	
	// reset flags
	created = false; 
	updated = false;
	
	db = databases.openDatabase(config);
	assert.equal("test.db", db.name);
	assert.equal(2, db.version);
	assert.ok(!created);
	assert.ok(updated);
};


exports.testTransaction_ShouldCallCallbacksSensibly = function () {
	
	var db = databases.openDatabase(config);
	assert.ok(typeof db !== "undefined");
	
	var called = 0;
	db.transaction(function(tx) {
		tx.execStatement("SELECT * FROM aTable;", [], function (token) {
			// here token is just the array [1].
			// this is not going to be the case in a real platform.
			called += 1;
		});
		tx.execStatement("SELECT * FROM aTable;", [], function (token) {
			called += 1;
		});
	});
	assert.equal(2, called);

};

exports.testTransaction_ShouldNotNestTransactions = function () {
	console.log("Expected 'Stale transaction' messages");
	var db = databases.openDatabase(config);
	var called = 0;
	db.transaction(function(tx) {
		tx.execStatement("SELECT * FROM aTable;", [], function (token) {
			called += 1;
			tx.execStatement("SELECT * FROM aTable;", [], function (token) {
				called += 1;
			});
		});
	});
	assert.equal(1, called);
};

exports.testCreateScript_ShouldCallTransactions = function () {
	var called = 0;
	config.onCreate = function (tx) {
		called = 1;
		tx.execStatement("CREATE TABLE aTable {};", [], function (token) {
			// here token is just the number 1.
			// this is not going to be the case in a real platform.
			called += 1;
		});
		tx.execStatement("CREATE TABLE anotherTable {};", [], function (token) {
			called += 1;
		});
	};
	
	var db = databases.openDatabase(config);
	assert.equal(2, nativeSyncExecSqlCalled);
	assert.equal(3, called);
};

exports.testCreateScript_ShouldNotNestTransactions = function () {
	var called = 0;
	console.log("Expected 'Stale transaction' messages");
	config.onCreate = function (tx) {
		called = 1;
		tx.execStatement("CREATE TABLE aTable {};", [], function (token) {
			// here token is just the number 1.
			// this is not going to be the case in a real platform.
			called += 1;
			tx.execStatement("CREATE TABLE anotherTable {};", [], function (token) {
				called += 1;
			});
		});
	};
	
	var db = databases.openDatabase(config);
	assert.equal(2, called);	
};

exports.testOpenDatabase_ShouldHaveCallbacks = function () {
	var opened = false, error = false;
	
	config.onOpened = function () {
		opened = true;
	};
	config.onError = function () {
		error = true;
	};
	
	var db = databases.openDatabase(config);
	assert.ok(opened);
	assert.ok(!error);
	// also call on opened a second time round.
	opened = false;
	config.onOpened = function () {
		opened = true;
	};
	
	db = databases.openDatabase(config);
	assert.ok(opened);
	assert.ok(!error);
	
	opened = false;
	var fn = backend.replaceableOpenDatabase;
	backend.replaceableOpenDatabase = function () {
		throw "Silly error";
	};
	
	db = databases.openDatabase(config);
	backend.replaceableOpenDatabase = fn;
	
	assert.ok(error);
	assert.ok(!opened);
};

exports.testUpdateScript_ShouldCallTransactions = function () {
	var called = 0;
	// we'll open it once with an old version.
	var db = databases.openDatabase(config);
	nativeOpenDatabaseCalled = 0;
	config.onUpdate = function (tx) {
		called = 1;
		tx.execStatement("ALTER TABLE aTable {};", [], function (token) {
			// here token is just the number 1.
			// this is not going to be the case in a real platform.
			called += 1;
		});
		tx.execStatement("ALTER TABLE anotherTable {};", [], function (token) {
			called += 1;
		});
	};
	config.version = 2; // trigger update
	var db = databases.openDatabase(config);
	assert.equal(2, nativeSyncExecSqlCalled);
	assert.equal(3, called);
	
};

exports.testUpdateScript_ShouldNotNestCallsWithTheSameTransaction = function () {
	var db = databases.openDatabase(config);
	nativeOpenDatabaseCalled = 0;
	console.log("Expected 'Stale transaction' messages");
	var called = 0;
	config.onUpdate = function (tx) {
		called = 1;
		tx.execStatement("ALTER TABLE aTable {};", [], function (token) {
			// here token is just the number 1.
			// this is not going to be the case in a real platform.
			called += 1;
			tx.execStatement("ALTER TABLE anotherTable {};", [], function (token) {
				called += 1;
			});
		});
	};
	
	config.version = 2; // trigger update
	db = databases.openDatabase(config);
	assert.equal(1, nativeSyncExecSqlCalled);
	assert.equal(2, called);	
	assert.equal(1, nativeOpenDatabaseCalled);
};

exports.testTransaction_CanHaveCallbacks = function () {
	var db = databases.openDatabase(config);
	var success = false;
	db.transaction(function (tx) {
		tx.execStatement("SELECT *", [], function (token) {success = true; });
	});
	assert.ok(success);
	
	success = false;
	db.transaction(function (tx) {
		tx.execStatement("SELECT *", []);
		success = true;
	});
	assert.ok(success);
	
	success = false;
	db.transaction(function (tx) {
		tx.execStatement("SELECT * FROM aTable");
	}, null, function () {
		// called on success
		success = true;
	});
	assert.ok(success);
};

exports.testTransaction_CanHaveErrorCallbacks = function () {	
	var err = null;
	var success = false;
	var db = databases.openDatabase(config);
	db.transaction(function (tx) {
		tx.execStatement("error");
	}, function (e) {
		err = e;
	}, function () {
		// called on success
		success = true;
	});
	
	assert.ok(!_.isNull(err));
	assert.ok(!success);
};

exports.testTransaction_ExecSqlFile = function () {
	var called = 0;
	var db = databases.openDatabase(config);
	
	db.transaction(function (tx) {
		fakeFileData = "statement1; statement2;"
		tx.execSqlFile("myFile.sql", function () {
			called ++;
		}, function (f) {
			assert.fail("Wrongly called sqlFile.onError()");
		});	
	}, function () {
		assert.fail("Wrongly called tx.sqlFile.onError()");
	}, function () {
		called ++; 
	});
	
	setTimeout(function () {
		assert.equal(2, called);
	}, testWaitTime);
	
	return testWaitTime;
};

exports.testCreateScript_ExecSqlFile = function () {
	var called = 0;
	config.onCreate = function (tx) {
		fakeFileData = "statement1; statement2;"
		tx.execSqlFile("myCreateScript.sql", function () {
			console.log("Successfully executed file");
			called += 3;
		}, function (e) {
			assert.fail("Wrongly called tx.onError(): " + e);
		});
	};
	
	config.onError = function (e) {
		assert.fail("Wrongly called openDatabase(.onError): " + e);
	};
	
	config.onOpened = function () {
		called += 5;
	};
	databases.openDatabase(config);

	setTimeout(function () {
		// 3 onOpened not called
		// 5 execSqlFile onSuccess not called
		// 13 = onOpened called twice
		assert.equal(8, called);
	}, testWaitTime);
	return testWaitTime;
};

exports.testCreate_ExecSqlFile_Error = function () {
	var called = 0;
	
	config.onCreate = function (tx) {
		fakeFileData = "error; statement;";
		tx.execSqlFile("myCreateScriptWithErrors.sql", function () {
			assert.fail("Wrongly called tx.onSuccess()");
		}, function (e) {
			called ++;
			//console.log(called + ". Correctly called tx.onError(): " +  e);
		});
	};
	
	config.onError = function (e) {
		called ++;
		//console.log(called + ". Correctly called openDatabase(.onError()): " +  e);
	};
	
	config.onOpened = function () {
		assert.fail("Wrongly called onOpened()");
	};
	databases.openDatabase(config);
	
	setTimeout(function () {
		assert.equal(2, called);
	}, testWaitTime);
	
	return testWaitTime;
};

exports.testTransaction_ExecSqlFile_StatementsExecutedConsecutively = function () {
	var db = databases.openDatabase(config);
	var ordering = "";
	db.transaction(function (tx) {
		fakeFileData = "create table 1; create table 2;";
		tx.execSqlFile("file.sql", function onSuccess() {
			ordering += "1";
		});
		
		fakeFileData = "insert into 1; insert into 2;";
		tx.execSqlFile("another.sql", function onSuccess() {
			ordering += "2";
		});
		
		tx.execStatement("INSERT blah", [], function onSuccess() {
			ordering += "3";
		});
	});
	
	setTimeout(function () {
		assert.equal("123", ordering);
	}, 2 * fileLoadTime + 100);
	
};

exports.testTransaction_onSuccessCallbacksAreCalledAfterAllStatementsAreExecuted = function () {
	var db = databases.openDatabase(config);
	
	var ordering = "";
	var newOnSuccess = function (str) {
		return function () {
			ordering += str;
		};
	};
	
	db.transaction(function (tx) {
		tx.execStatement("yes", [], newOnSuccess(1));
		tx.execStatement("yes", [], newOnSuccess(2));
		tx.execStatement("yes", [], newOnSuccess(3));
	}, function (err) {
		assert.fail("Should have no errors");
	}, function onSuccess () {
		assert.equal("123", ordering);
	});

	ordering = "";
	db.transaction(function (tx) {
		tx.execStatement("yes", [], newOnSuccess(1));
		tx.execStatement("error", [], newOnSuccess(2));
		tx.execStatement("yes", [], newOnSuccess(3));
	}, function (err) {
		// no statements' onSuccess should've been called.
		assert.equal("", ordering);
	}, function onSuccess () {
		assert.fail("Should not have failed");
	});
};

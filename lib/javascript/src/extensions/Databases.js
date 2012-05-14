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

/**
 * Example usage:
 * 
 * var databases = require("Databases");
 * 
 * db = databases.openDatabase({
 *     filename: "myDatabase.db",
 *     version: 1
 *     onCreate: function (tx) {},
 *     onUpdate: function (tx) {},
 *     onError: function () {}
 * });
 * 
 * db.transaction(function (tx) {
 *     // statements.
 *     tx.execStatement("INSERT blah", []);
 *     tx.execSqlFile("myFile.sql");
 *     tx.execStatementWithUniqueReturn("SELECT foo, bar FROM aTable", [], function callback (row) {
 *          console.log(row.foo);
 *     });
 * }, function onError (err) {}, function onComplete () {});
 * 
 * db.readTransaction(function (tx) {
 *      tx.execStatement("INSERT blah SET x=?", [foo]);
 *      tx.execStatement("SELECT * FROM aTable", [], function callback (token) {
 *          // token should be passed directly to the UI, and cannot be manipulated in Javascript.
 *      });
 *      tx.execStatementWithUniqueReturn("SELECT foo, bar FROM aTable", [], function callback (row) {
 *          console.log(row.foo);
 *      });
 *      tx.execStatementWithJsonReturn("SELECT foo, bar FROM aTable", [], function callback (rows) {
 *          console.log(rows[0].foo);
 *      });
 * });
 * 
 */
var kirin = require("kirin"), 
        backend, _;
   
   	exports.onLoad = function (nativeObject) {
   		backend = nativeObject;
        _ = require("underscore");
   	};
   	
   	exports.onUnload = function () {
   		backend = null;
   	};
   	
    var wrapCallback = function (callback, name) {
        
        if (_.isFunction(callback)) {
            return kirin.wrapCallback(callback, "db.", name || "sql");
    } else if (_.isString(callback)) {
        return callback;
    }
    return null;
};

var transactionPrototype = (function () {

    var addToTxLog = function (tx, type, sql, params, callback, errback) {
        if (tx.isStale) {
            console.log("Transaction is stale");
        } else {
            tx.txLog.push([type, sql, params, wrapCallback(callback), wrapCallback(errback)]);
        }
    };
    
    var txCount = 0;
    
    return {
        init: function (db) {
            this.txLog = [];
            this.database = db.name;
            this.id = db.name + txCount;
            this.isStale = false;
            txCount += 1;
        },
        
        readOnly: false,
        
        execStatement: function (sql, params, callback, errback) {
            addToTxLog(this, "rowset", sql, params, callback, errback);
        },
        
        execStatementWithUniqueReturn: function (sql, params, callback, errback) {
            addToTxLog(this, "row", sql, params, callback, errback);
        },
        
        execStatementWithJsonReturn: function (sql, params, callback, errback) {
            addToTxLog(this, "array", sql, params, callback, errback);
        },
        
        execSqlFile: function (sqlFile, callback, errback) {
            addToTxLog(this, "file", sqlFile, null, callback, errback);
        }    
    };
})(); 

var txCaller = function (tx, statements, callNative, onError, onSuccess) {
    backend.beginTransaction_({
        dbName:tx.database, 
        txId:tx.id, 
        onErrorToken:wrapCallback(onError), 
        onSuccessToken:wrapCallback(onSuccess)
    });
    // call the function that will populate the log
    // i.e. defines the statements to be executed.
    statements(tx);
    // the call the native side, with the appropriate method.
    var log = tx.txLog;
    var keyholeSize = 10;
    for (var i=0, max=log.length; i<=max; i+=keyholeSize) {
        callNative(tx, log.slice(i, i+keyholeSize));
    }
    
    //callNative(tx, tx.txLog);
    tx.isStale = true;
    backend.endTransaction_(tx.id);
};


var databasePrototype = (function () {
    var execStatements = function (tx, statements, onError, onSuccess) {
        // You need to provide a method.
        if (_.isFunction(statements)) {
            // now do something with the tx.txLog
            txCaller(tx, statements, function (tx, log) {
                backend.tx_appendToTransactionScript_(tx.id, log);
            }, onError, onSuccess);
        }
    };
    
    return {
        init: function () {
            
        },
        
        name: null,
        
        transaction: function (statements, onError, onSuccess) {
            var tx = _.clone(transactionPrototype);
            tx.init(this);
            
            tx.readOnly = false;
            execStatements(tx, statements, onError, onSuccess);
        },
        
        readTransaction: function (statements, onError, onSuccess) {
            var tx = _.clone(transactionPrototype);
            tx.init(this);
            
            delete tx.execSqlFile;
            tx.readOnly = true;
            execStatements(tx, statements, onError, onSuccess);
        }
    };
})();

/*
 * 
 */
exports.openDatabase = function (config) {
    
    var api = require("api-utils");
    api.normalizeAPI({    
        'function': {
            mandatory: ['onCreate'],
            optional: ['onUpdate', 'onError', 'onOpened']
        },
        'string': {
            mandatory: ['filename']
        },
        'number': {
            mandatory: ['version']
        }
    }, config);

    var db = _.clone(databasePrototype);
    db.init();

    db.name = config.filename;
    db.version = config.version;
    
    var name = config.filename,
        tx = _.clone(transactionPrototype);
    tx.init(db);
    tx.readOnly = false;
 
    var configCopy = _.clone(config);
 
    // with the copy of the config, convert all the callbacks 
    // into callback tokens.
    var version = configCopy.version;
    configCopy.onOpenedToken = wrapCallback(function () {
        config.onOpened(db);
    }, "onOpened.");
    configCopy.onErrorToken = wrapCallback(config.onError, "onError.");
    
    // for update and create, we should be using th 
    // appending to the opener script rather than than
    // transaction script.
    configCopy.onCreateToken = wrapCallback(function () {
        txCaller(tx, config.onCreate, function (tx, log) {
            backend.tx_appendToOpenerScript_(tx.id, log);
        }, configCopy.onErrorToken, configCopy.onOpenedToken);
    }, "onCreate.");
    configCopy.onUpdateToken = wrapCallback(function (prevVersion) {
            txCaller(tx, 
                function (tx) {
                    config.onUpdate(tx, prevVersion, version);
                }, 
                function (tx, log) {
                    backend.tx_appendToOpenerScript_(tx.id, log);
                }, 
                configCopy.onErrorToken, configCopy.onOpenedToken);
        }, "onUpdate.");
    configCopy.txId = tx.id;
    
    _.each(["onCreate", "onUpdate", "onOpened", "onError"], function (key) {
        delete configCopy[key];
    });
    
    // finally, call the native side with a copy of the config.
    backend.db_openOrCreate_(name, configCopy);
    
    return db;
};

exports.dispose = function (token) {
    backend.diposeToken_(token);
};

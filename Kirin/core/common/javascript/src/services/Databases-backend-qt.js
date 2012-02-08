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
 * Implementation notes: https://docs.google.com/a/futureplatforms.com/document/d/1wfLAVtJanIEUCMKmW0hmwvFhxQ71dCHrKAXLlQlZ2HE/edit?hl=en#
 */
defineModule("Databases-backend", function (require, exports) {
    var backend = {},
        databases = {},
        kirin = require("kirin");

    backend.replaceableOpenDatabase = function (filename, requestedVersion) {
		// we'll look after the version numbers;
		// hard code the version number, so Qt never need complain about a SQLException.version_err
        return openDatabaseSync(filename, "1.0", filename, 1000000);
    };
    
    backend.replaceableTransaction = function (db, txBody, tx) {
        var nativeBody = function (nativeTx) {
            var err = txBody(tx, nativeTx);
            if (err) {
                throw err;
            }
        };
        return tx.readOnly ? db.readTransaction(nativeBody) : db.transaction(nativeBody);
    };
    
    backend.replaceableSyncExecSql = function (nativeTx, sql, params) {
        return nativeTx.executeSql(sql, params);
    };
    

    backend.replaceableLoadStaticFile = function (filename, callback, errback) {
        var settings = require("Settings"),
            localFiles = kirin.proxy("cppLocalFiles"),
            rootDir = settings.get("APP_ROOT_PATH"),
            path = rootDir + "/shared" + filename, 
            err;
        
        try {
            var str = localFiles.load(path);
            
            if (str) {
                callback(str);
                return;
            }
            err = "File is empty"; 
        } catch (e) {
            err = e;
        }
        
        console.log("Error loading file " + path +": " + err);
        if (errback) {
            errback(err);
        }
        
    };
    

    var txMap = {};
    backend.db_openOrCreate_ = function (filename, config) {
        var settings = require("Settings");
        
        var existingVersion = settings.get(filename + ".database.version");
        var requestedVersion = config.version;
        
        
        
        try {
            // actually open the database.
            databases[filename] = backend.replaceableOpenDatabase(filename, requestedVersion);
            
            // decide if we need to call onCreate or onUpdate.
            var callback = null;
            if (existingVersion) {
                if (requestedVersion > existingVersion) {
                    callback = config.onUpdateToken;
                }
                existingVersion = 0;
            } else {
                callback = config.onCreateToken;
            }
            
            // call back into Javascript with the relevant onUpdate or onCreate.
            if (callback) {
                var txId = config.txId;
                txMap[txId] = {
                    txId: txId,
                    // we need to rev the database version, but only if we are successful in creating or updating.
                    onInternalSuccess: function () {
                        settings.put(filename + ".database.version", requestedVersion);
                        settings.commit();
                    }, 
                    readOnly: false
                };            
                kirin.native2js.callCallback(callback, existingVersion, requestedVersion);
            } else {
                // if not, just call onOpened.
                kirin.native2js.callCallback(config.onOpenedToken, 0);
            }
            
        } catch (err) {
            if (err.stack) {
                console.error(err.stack);
            } else {
                console.error(err);
            }
            kirin.native2js.callCallback(config.onErrorToken, err);
            
        }
        kirin.native2js.deleteCallback(config.onUpdateToken, config.onCreateToken);
        
        
    };
    
    var recordStatementsFromFile = function (tx, filename, log, callbackToken, errbackToken) {
        var fileIndex = tx.logIndex;
        
        backend.replaceableLoadStaticFile(filename, function (text) {
            // file loading has succeeded. Now cue up the statements for execution.
            var fileLog = [fileIndex, 1];
            var statements = text.split(";");
            var line;
            for (var i=0, max=statements.length; i<max; i++) {
                line = statements[i];
                // trim.
                line = line.replace(/^\s*(.*)\s*$/, "$1");
                if (line !== "") {
                    fileLog.push(["rowset", line, [], null, errbackToken]);
                }
            }
            fileLog.push(["fileExecuted", null, null, callbackToken, errbackToken]);
            Array.prototype.splice.apply(log, fileLog);
            tx.continuation(tx);
        }, function (err) {
            // when loading the file doesn't succeed.
            log.splice(fileIndex, 1, ["fileLoadProblem", err, null, callbackToken, errbackToken]);
            tx.continuation(tx);
        });
    };
    
    var recordStatements = function (txId, txList) {
        var tx = txMap[txId];
        var line, xhr;
        if (tx && !tx.isStale) {
            var log = tx.log;
            for (var i=0, max=txList.length; i<max; i++) {
                log.push(txList[i]);
            }
        }
    };
    
    backend.tx_appendToOpenerScript_ = recordStatements;
    
    backend.tx_appendToTransactionScript_ = recordStatements;
    
    
    backend.beginTransaction_ = function (txFromJS) {
        // NB: This came from the Javascript side, but comes to us as a JSON object.
        /*
         * {
         *     dbName:database id, 
         *     txId:transaction id, 
         *     onErrorToken:errback token, 
         *     onSuccessToken:callback token,
         *     readOnly: bool
         * }
         */
        var tx = txMap[txFromJS.txId];
        if (tx) {            
            _.extend(tx, txFromJS);
        } else {
            tx = _.clone(txFromJS); // TODO
            txMap[txFromJS.txId] = tx;
        }

        tx.log = [];
    };

    backend.endTransaction_ = (function () {
        
        var rowsetTo = {
                rowset: function (rs) {
                    return rs;
                },
                row: function (rs) {
                    if (rs.rows.length > 0) {
                        return rs.rows.item(0);
                    } else {
                        return {};
                    }
                },
                array: function (rs) {
                    var array = [];
                    for (var i=0, max=rs.rows.length; i<max; i++) {
                        array.push(rs.rows.item(i));
                    }
                    return array;
                }
            };

        var execSingleStatementSql = function (nativeTx, sql, params) {
            try {
                var errString = null;
                if (_.isFunction(params)) {
                    console.warn("Parameters should be an array: " + sql);
                    params = [];
                } else if (!_.isArray(params)) {
                    params = [];
                }
                var result = backend.replaceableSyncExecSql(nativeTx, sql, params);
                if (typeof result === "string") {
                    throw result;
                }
                return result;        
            } catch (err) {
                var str = "[" + params.join(", ") + "]";
                console.error("Backend error executing SQL: " + err + "\n" + sql + " " + str);
                throw err;
            }
        };
        
        var executeTransactionLog = function (tx, nativeTx) {
            var log = tx.log,
                s, type, sql, params, callback, errback, transform, result;
            var successLog = [];
            
            try {
                for (var i=0, max=log.length; i<max; i++) {
                    s = log[i];
                    
                    type = s[0];
                    sql = s[1];
                    params = s[2];
                    callback = s[3];
                    errback = s[4];
                    transform = rowsetTo[type];
                    if (transform) {
                        result = execSingleStatementSql(nativeTx, sql, params);
                        if (callback) {
                            successLog.push([callback, transform, result]);
                        }
                    } else {
                        if (type === "fileExecuted") {
                            if (callback) {
                                successLog.push(callback);
                            }
                        } else {
                            // this really shouldn't happen.
                            // if it does then either the recordStatements method or the recordStatementsFromFile 
                            // methods are adding incorrect types to this log.
                            console.error("Could not deal with " + type + ": " + sql);
                        }
                    }
                }
            } catch (err) {
                if (errback) {
                    kirin.native2js.callCallback(errback, err);
                }
                return err;
            }
            
            // now we've collected all results, we should call the onSuccess callbacks.
            
            for (var j=0, maxj=successLog.length; j<maxj; j++) {
                try {
                    s = successLog[j];
                    if (!_.isArray(s)) {
                        kirin.native2js.callCallback(s);
                    } else {
                        callback = s[0];
                        transform = s[1];
                        result = s[2];
                        kirin.native2js.callCallback(callback, transform(result));
                    }
                } catch (err2) {
                    console.log("Error executing onSuccess callback: " + callback);
                    if (err2.stack) {
                        console.error(err2.stack);
                    } else {
                        console.error(err2);
                    }
                }
            }
        };

        // use a continuation so we can stop processing 
        // halfway through, and then resume when a callback has finished.
        var processLogContinuation = function (tx) {
            var log = tx.log;
            var txId = tx.txId;

            var db = databases[tx.dbName];
            var s, type, sql, params, callback, errback;
            var rs, err, transform, max, i;
//            if (!tx.readOnly && log.length == 2) {
//                log = [];
//            }
            for (max=log.length; tx.logIndex<max; tx.logIndex++) {
                s = log[tx.logIndex];
         
                type = s[0];
                sql = s[1];
                params = s[2];
                callback = s[3];
                errback = s[4];
 
                if (type === "file") {
                    recordStatementsFromFile(tx, sql, log, callback, errback);
                    // continuation will be called once the file has been loaded.
                    return;
                } else if (type === "fileLoadProblem") {
                    err = "File: " + sql;
                    if (errback) {
                        kirin.native2js.callCallback(errback, err);
                    }
                }
                if (err) {
                    break;
                }
            }
            if (!err && log.length > 0) {
                try {
                    err = backend.replaceableTransaction(db, executeTransactionLog, tx);
                } catch (nativeErr) {
                    err = nativeErr;
                }
            }
            delete txMap[txId];
            callback = null;
            if (!err) {
                if (_.isFunction(tx.onInternalSuccess)) {
                    // update the database version if it needs it.
                    tx.onInternalSuccess();
                }
                callback = tx.onSuccessToken;
            } else {
                callback = tx.onErrorToken;
            }
            if (callback) {
                kirin.native2js.callCallback(callback, err);
            }
            
            
            
            // cleanup after ourselves.
            // in the context of kirin-js this isn't necessary, however for -webview implementations 
            // this would be. 
            kirin.native2js.deleteCallback(tx.onSuccessToken, tx.onErrorToken);
            for (i=0, max=log.length; i<max; i++) {
                kirin.native2js.deleteCallback(log[i][3], log[i][4]);
            }
            
        };
        
        return function (txId) {
            var tx = txMap[txId];
            if (!tx) {            
                console.error("Transaction doesn't exist: " + txId);
                return;
            }
            tx.logIndex = 0;

            tx.continuation = processLogContinuation;
            tx.continuation(tx);
        };
    })();
    
    backend.diposeToken_ = function (token) {
        // NOP
        // this is to help the iOS/Android version with garbage collection.
    };
    
    kirin.native2js.registerProxy("Databases-backend", backend);
});
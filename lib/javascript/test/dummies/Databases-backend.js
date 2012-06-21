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

defineModuleAlias("Databases-backend", "Databases-backend-qt");

var kirin = require("kirin"),
    backend = kirin.proxy("Databases-backend");

backend.replaceableOpenDatabase = function (filename, requestedVersion) {
    
};

backend.replaceableSyncExecSql = function (db, sql, params) {
    return {
        rows : {
            length : 0,
            item: function (i) { return i;} 
        }
    };
}

backend.replaceableOpenDatabase = (function () {
    return function (filename, version) {
    
        //console.log("Native: openDatabase('" + filename + "', " + version + ")");
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
var fakeFileData = "statement1; statement2;"
backend.replaceableLoadStaticFile = function (filename, callback, errback) {
    var data = fakeFileData;
    setTimeout(function () {    
        callback(data);
    }, fileLoadTime);
};
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


var net = require("device-networking-alpha"),
    settings = require("app-preferences"),
    api = require("../utils/api-utils"),
    _ = require("underscore");    
exports.isYES = function(string) {
    if (!string) {
        return false;
    }
    string = string.toLowerCase();
    return (string === "yes" || string === "true");

};

exports.replaceableSetTimeout = function(func, time) {
    require("window").setTimeout(func, time);
};


exports.createProxocubeClient = (function() {

    var prototypeClient = {
        sync : function(db) {
            var items = [], 
                revision = this.revision, 
                url = this.url;

            if (revision >= 0) {
                url += "/" + (revision + 1);
            }

            console.log("Downloading from " + url);
            var client = this;
            
            net.downloadJSONList( {
                url : url,

                each : function(item) {
                    items.push(item);
                    if(typeof item.revision !== "undefined" ) {
                        revision = Math.max(item.revision, revision);
                    }
                },

                onFinish : function(count) {
                    var prevRevision = client.revision, 
                        firstTime = prevRevision === -1;
                    client.revision = revision;
                    if (count !== items.length) {
                        console.log("Counts disagree!! count=" + count + "; length=" + items.length);
                    }
                    var item;
                    
                    if (_.isFunction(client.onSyncStartingBeforeReallyStarted)) {
                        client.onSyncStartingBeforeReallyStarted(count);
                    }
                    exports.replaceableSetTimeout(function() {
                        db.transaction(function(tx) {
                            client.onSyncStarting(tx, count);
                            
                            for ( var i = 0; i < count; i++) {
                                item = items[i];
                                if (!_.isUndefined(item.deleted) && item.deleted) {
                                    client.onDelete(tx, item);
                                } else {
                                    client.onInsertOrUpdate(tx, item, firstTime);
                                }
                            }

                            client.onSyncCompleting(tx, prevRevision, revision);
                        }, function(err) {
                            console.log("Proxocube/database problem: " + err);
                            client.onError(err);
                        }, function() {
                            // once the sync is complete, then we can update the
                            // revision.
                            console.log("Proxocube.onFinish at revision: " + revision);
                            settings.put("proxocube.revision." + client.url, revision);
                            settings.commit();
                            client.onSyncComplete(db);
                        });

                        items = null;
                    }, 1);
                },

                onError : function(err) {
                    console.log("Proxocube/download problem: " + err);
                    client.onError(err);
                }
            });
        }

    };

    return function(config) {
        api.normalizeAPI( {
            string : {
                mandatory : [ "urlSuffix" ],
                defaults : {
                    // TODO this need not have a fallback, iff Environment can be mocked up in test.
                    "urlPrefix" : settings.get("proxocube.prefix") || "proxo/dev_glasto/",
                    "urlHostname" : settings.get("proxocube.hostname") || "http://fp-proxocube-jh.appspot.com/"
                }
            },
            'function' : {
                mandatory : [ 'onInsertOrUpdate', 'onDelete' ],
                optional : [ 'onSyncStarting', 'onSyncCompleting', 'onSyncComplete', 'onError' ]
            },
            number : {
                optional : [ 'revision' ]
            }
        }, config);

        config.url = config.urlHostname + config.urlPrefix + config.urlSuffix;
        var revision = config.revision || settings.get("proxocube.revision." + config.url) || -1;
        config.revision = parseInt(revision, 10);
        console.log("Proxocube at revision: " + config.revision);
        return _.extend(_.clone(prototypeClient), config);
    };

}());

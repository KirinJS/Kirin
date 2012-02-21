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


package com.futureplatforms.kirin.api;

import org.json.JSONArray;
import org.json.JSONObject;

import com.futureplatforms.kirin.platformservices.IPlatformService;

public interface IDatabasesBackend extends IPlatformService {
    void db_openOrCreate_(String dbName, JSONObject config);

    void beginTransaction_(JSONObject config);

    void tx_appendToTransactionScript_(String txId, JSONArray log);

    void tx_appendToOpenerScript_(String txId, JSONArray log);

    void endTransaction_(String txId);

    void diposeToken_(String token);
}

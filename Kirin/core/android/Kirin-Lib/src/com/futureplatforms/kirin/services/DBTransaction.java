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


package com.futureplatforms.kirin.services;

import java.util.LinkedList;
import java.util.List;

import org.json.JSONArray;


public class DBTransaction {

    public final String mTxId;
    private final List<DBStatement> mEntries = new LinkedList<DBStatement>();

    public final String mOnSuccess;
    public final String mOnError;

    public final int mSchemaVersion;
    public final boolean mReadOnly;
    public final String mDbName;





    public DBTransaction(String dbName, String txId, String onSuccessToken, String onErrorToken, boolean readOnly,
            int schemaVersion) {
        mTxId = txId;
        mOnSuccess = onSuccessToken;
        mOnError = onErrorToken;
        mSchemaVersion = schemaVersion;
        mReadOnly = readOnly;
        mDbName = dbName;
    }

    public DBTransaction(String dbName, String txId, String onSuccessToken, String onErrorToken, boolean readOnly) {
        this(dbName, txId, onSuccessToken, onErrorToken, readOnly, -1);
    }

    public List<DBStatement> getEntries() {
        return mEntries;
    }

    public void appendTo(JSONArray log) {
        for (int i = 0, max = log.length(); i < max; i++) {
            JSONArray sqlStatement = log.optJSONArray(i);

            DBStatement s = DBStatement.createStatement(sqlStatement);
            
            mEntries.add(s);
        }
    }
}

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


package com.futureplatforms.kirin.extensions.databases;

import org.json.JSONArray;

import com.futureplatforms.kirin.internal.JSONUtils;

import android.database.Cursor;

public class DBStatement {
    public enum StatementType {
        rowset, row, array, file, eof
    }
    
    public StatementType mType;
    public String mSql;
    public String[] mParams;
    public String mOnSuccess;
    public String mOnError;
    
    public Cursor mResult;

    public static String[] toArray(JSONArray json) {
        if (json == null) {
            return new String[0];
        }
        String[] array = new String[json.length()];
        for (int i=0, max=json.length(); i<max; i++) {
            array[i] = JSONUtils.stringOrNull(json, i, null);
        }
        return array;
    }
    
    public static DBStatement createStatement(JSONArray sqlStatement) {
        StatementType type = StatementType.valueOf(sqlStatement.optString(0));
        String sql = sqlStatement.optString(1);
        JSONArray params = sqlStatement.optJSONArray(2);
        String onSuccess = JSONUtils.stringOrNull(sqlStatement, 3, null);
        String onError = JSONUtils.stringOrNull(sqlStatement, 4, null);
    
        DBStatement s = new DBStatement();
        // TODO worry about files.
        s.mType = type;
        s.mSql = sql;
        s.mOnSuccess = onSuccess;
        s.mOnError = onError;
        s.mParams = toArray(params);
        return s;
    }
}
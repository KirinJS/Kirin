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


package com.futureplatforms.kirin.internal.fragmentation;

import java.text.MessageFormat;

import org.json.JSONException;
import org.json.JSONObject;

import android.database.AbstractWindowedCursor;
import android.util.Log;

import com.futureplatforms.kirin.C;

public class CursorCoercer4 implements CursorCoercer {
    public JSONObject coerceToJSONObject(String[] cols, AbstractWindowedCursor c) {
        JSONObject obj = new JSONObject();
        for (int i = 0; i < cols.length; i++) {
            String name = cols[i];

            if (c.isNull(i)) {
                continue;
            }
            String str = null;
            try {
                str = c.getString(i);
            } catch (Exception e) {
                // not a string
                Log.i(C.TAG, MessageFormat.format("Column {0} could not be represented as a string", name), e);
            }
            Object res = null;
            try {
                if (res == null) {
                    res = Long.parseLong(str);
                }
            } catch (Exception e) {
                // wasn't a long!
            }
            try {
                if (res == null) {
                    res = Double.parseDouble(str);
                }
            } catch (Exception e) {
                // wasn't a double!
            }
            if (res == null) {
                res = str;
            }

            if (res != null) {
                try {
                    obj.putOpt(name, res);
                } catch (JSONException e) {
                    Log.e(C.TAG, e.getLocalizedMessage(), e);
                }
            }
        }
        return obj;
    }
}

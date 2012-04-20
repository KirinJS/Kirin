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

import org.json.JSONException;
import org.json.JSONObject;

import android.database.AbstractWindowedCursor;
import android.util.Log;

import com.futureplatforms.kirin.C;

public class CursorCoercer5 implements CursorCoercer {
    /* (non-Javadoc)
     * @see com.futureplatforms.android.jscore.fragmentation.CursorCoercer#coerceToJSONObject(java.lang.String[], android.database.AbstractWindowedCursor)
     */
    @Override
    public JSONObject coerceToJSONObject(String[] cols, AbstractWindowedCursor c) {
        JSONObject obj = new JSONObject();
        for (int i = 0; i < cols.length; i++) {
            String name = cols[i];
            // do we have to worry about types?
            // if we do, then we need the CursorWindow.

            // TODO we can make this faster for SDK > 5.
            // TODO have a separate class depending on SDK.
            try {
                if (c.isString(i)) {
                    obj.putOpt(name, c.getString(i));
                } else if (c.isLong(i)) {
                    obj.put(name, c.getLong(i));
                } else if (c.isFloat(i)) {
                    obj.put(name, c.getDouble(i));
                } else if (c.isNull(i)) {
                    obj.remove(name);
                }
            } catch (JSONException e) {
                Log.e(C.TAG, e.getLocalizedMessage(), e);
            }
        }
        return obj;
    }
}

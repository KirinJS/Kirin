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


package com.futureplatforms.kirin.extensions.settings;

import java.util.Iterator;
import java.util.Map;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.content.Context;
import android.content.SharedPreferences;
import android.content.SharedPreferences.Editor;
import android.preference.PreferenceManager;

import com.futureplatforms.kirin.extensions.KirinExtensionAdapter;

public class SettingsBackend extends KirinExtensionAdapter implements ISettingsBackend {

    private SharedPreferences mPreferences;

    public SettingsBackend(Context context) {
    	this(context, null);
    }
    
    public SettingsBackend(Context context, SharedPreferences preferences) {
    	super(context, "app-preferences");
    	if (preferences == null) {
    		preferences = PreferenceManager.getDefaultSharedPreferences(context);
    	}
        mPreferences = preferences;
    }

    @Override
    public void onLoad() {
    	super.onLoad();
        mKirinHelper.jsMethod("mergeOrOverwrite", mPreferences.getAll());
        mKirinHelper.jsMethod("resetEnvironment");
    }
    
    /* (non-Javadoc)
     * @see com.futureplatforms.android.jscore.services.ISettingsBackend#updateContents_withDeletes_(org.json.JSONObject, org.json.JSONArray)
     */
    public void updateContents_withDeletes_(JSONObject contents, JSONArray deletes) {
        try {
            Editor editor = mPreferences.edit();

            for (int i = 0; i < deletes.length(); i++) {
                String key = deletes.getString(i);
                editor.remove(key);
            }

            for (Iterator<?> iterator = contents.keys(); iterator.hasNext();) {
                String key = (String) iterator.next();
                Object value = contents.get(key);

                if (value instanceof String) {
                    editor.putString(key, (String) value);
                } else if (value instanceof Boolean) {
                    editor.putBoolean(key, (Boolean) value);
                }  else if (value instanceof Integer) {
                    editor.putInt(key, (Integer) value);
                }  else if (value instanceof Float) {
                    editor.putFloat(key, (Float) value);
                }  else if (value instanceof Long) {
                    editor.putLong(key, (Long) value);
                }
            }

            editor.commit();
        } catch (JSONException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }

    /* (non-Javadoc)
     * @see com.futureplatforms.android.jscore.services.ISettingsBackend#requestPopulateJSWithCallback_(java.lang.String)
     */
    public void requestPopulateJSWithCallback_(String callbackToken) {
        Map<String, ?> copy = mPreferences.getAll();
        JSONObject obj = new JSONObject(copy);

        mKirinHelper.jsCallback(callbackToken, obj);
        mKirinHelper.cleanupCallback(callbackToken);
    }

}

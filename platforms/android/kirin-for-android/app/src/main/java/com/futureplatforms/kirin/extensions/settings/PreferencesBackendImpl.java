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
import android.content.SharedPreferences.OnSharedPreferenceChangeListener;
import android.preference.PreferenceManager;

import com.futureplatforms.kirin.extensions.KirinExtensionAdapter;
import com.futureplatforms.kirin.generated.preferences.KirinPreferenceListener;
import com.futureplatforms.kirin.generated.preferences.KirinPreferences;
import com.futureplatforms.kirin.generated.preferences.KirinPreferencesBackend;


/**
 * This is the new implementation of the app-preferences backend.
 * 
 * It is not yet ready for even testing. 
 * 
 * @author james
 *
 */
public class PreferencesBackendImpl extends KirinExtensionAdapter implements KirinPreferencesBackend {

    private SharedPreferences mPreferences;
    
    private KirinPreferences mModule;

    
    
    public PreferencesBackendImpl(Context context) {
    	this(context, null);
    }
    
    public PreferencesBackendImpl(Context context, SharedPreferences preferences) {
    	super(context, "app-preferences-alpha");
    	if (preferences == null) {
    		preferences = PreferenceManager.getDefaultSharedPreferences(context);
    	}
        mPreferences = preferences;
    }

    @Override
    public void onLoad() {
    	super.onLoad();
    	mModule = this.bindExtensionModule(KirinPreferences.class);
        mModule.mergeOrOverwrite(new JSONObject(mPreferences.getAll()));

        
        
    	mKirinHelper.jsMethod("mergeOrOverwrite", mPreferences.getAll());
        mKirinHelper.jsMethod("resetEnvironment");
    }
    
    @Override
    public void onUnload() {
    	super.onUnload();
    }
    
    /* (non-Javadoc)
     * @see com.futureplatforms.android.jscore.services.ISettingsBackend#updateContents_withDeletes_(org.json.JSONObject, org.json.JSONArray)
     */

	@Override
	public void updateStoreWithChangesAndDeletes(JSONObject changes,
			JSONArray deletes) {
        try {
            Editor editor = mPreferences.edit();

            for (int i = 0; i < deletes.length(); i++) {
                String key = deletes.getString(i);
                editor.remove(key);
            }

            for (Iterator<?> iterator = changes.keys(); iterator.hasNext();) {
                String key = (String) iterator.next();
                Object value = changes.get(key);

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


	@Override
	public void addPreferenceListener(final KirinPreferenceListener listener) {
		mPreferences.registerOnSharedPreferenceChangeListener(new OnSharedPreferenceChangeListener() {
			
			@Override
			public void onSharedPreferenceChanged(SharedPreferences sharedPreferences, String key) {
				listener.onPreferenceChange(key, sharedPreferences.getAll().get(key));
			}
		});		
	}

	@Override
	public void removePreferenceListener() {
		// TODO Auto-generated method stub
		
	}

		@Override
		public void addInterestFor(String preferenceName) {
			// TODO Auto-generated method stub
			
		}

	@Override
	public void removeInterestFor(String preferenceName) {
		// TODO Auto-generated method stub
		
	}

}

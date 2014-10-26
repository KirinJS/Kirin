package com.futureplatforms.kirin.generated.preferences;
 
import org.json.JSONObject;
import org.json.JSONArray;
import com.futureplatforms.kirin.generated.preferences.KirinPreferenceListener;
 
/**
 * Called in response to a settings.commit()
 */
public interface KirinPreferencesBackend {
 
    /**
     * @param changes {@link JSONObject}
     * @param deletes {@link JSONArray}
     */
    void updateStoreWithChangesAndDeletes(JSONObject changes, JSONArray deletes);
 
    /**
     * @param listener {@link KirinPreferenceListener}
     */
    void addPreferenceListener(KirinPreferenceListener listener);
 
    void removePreferenceListener();
 
    /**
     * @param preferenceName {@link String}
     */
    void addInterestFor(String preferenceName);
 
    /**
     * @param preferenceName {@link String}
     */
    void removeInterestFor(String preferenceName);
}
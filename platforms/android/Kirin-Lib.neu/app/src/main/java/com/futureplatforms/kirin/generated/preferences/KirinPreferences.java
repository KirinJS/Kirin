package com.futureplatforms.kirin.generated.preferences;
 
import org.json.JSONObject;
 
/**
 * mergeOrOverwrite and resetEnviroment is called at onLoad() time
 */
public interface KirinPreferences {
 
    /**
     * @param latestNativePreferences {@link JSONObject}
     */
    void mergeOrOverwrite(JSONObject latestNativePreferences);
 
    void resetEnvironment();
}
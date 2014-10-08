package com.futureplatforms.kirin.generated.preferences;
 
 
/**
 * This is originates in Javascript, but is passed to native. Calling methods from native will call the corresponding js method
 */
public interface KirinPreferenceListener {
 
    /**
     * @param preferenceKey {@link String}
     * @param newValue {@link Object}
     */
    void onPreferenceChange(String preferenceKey, Object newValue);
 
    void onListeningEnding();
}
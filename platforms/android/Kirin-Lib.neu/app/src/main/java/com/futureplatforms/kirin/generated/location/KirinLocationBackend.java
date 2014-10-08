package com.futureplatforms.kirin.generated.location;
 
import com.futureplatforms.kirin.generated.location.KirinLocationListener;
 
/**
 * This is the backend of the location extension. This is implemented in native code, and talks to the js and the device.
 */
public interface KirinLocationBackend {
 
    /**
     * @param listener {@link KirinLocationListener}
     */
    void startWithLocationListener(KirinLocationListener listener);
 
    void stopLocationListener();
 
    void forceRefresh();
 
    void getPermissions();
}
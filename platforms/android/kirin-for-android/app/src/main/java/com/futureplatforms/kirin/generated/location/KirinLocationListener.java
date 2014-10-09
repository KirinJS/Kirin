package com.futureplatforms.kirin.generated.location;
 
import com.futureplatforms.kirin.generated.location.KirinLocationData;
import com.futureplatforms.kirin.generated.location.KirinLocationPermissions;
 
/**
 * This is originates in Javascript, but is passed to native. Calling methods from native will call the corresponding js method
 */
public interface KirinLocationListener {
 
    float getMinimumDistanceDelta();
 
    float getMinimumTimeDelta();
 
    /**
     * @param location {@link KirinLocationData}
     */
    void locationUpdate(KirinLocationData location);
 
    /**
     * @param errorMessage {@link String}
     */
    void locationError(String errorMessage);
 
    void locationUpdateEnding();
 
    /**
     * @param permissions {@link KirinLocationPermissions}
     */
    void updatePermissions(KirinLocationPermissions permissions);
}
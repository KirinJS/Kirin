package com.futureplatforms.kirin.generated.location;
 
 
/**
 * This is a Location data object. It is produced by the device, and then passed into the Javascript.
 */
public interface KirinLocationData {
 
    void setLatitude(double latitude);
 
    double getLatitude();
 
    void setLongitude(double longitude);
 
    double getLongitude();
 
    void setTimestamp(double timestamp);
 
    double getTimestamp();
 
    void setHorizontalAccuracy(double horizontalAccuracy);
 
    double getHorizontalAccuracy();
}
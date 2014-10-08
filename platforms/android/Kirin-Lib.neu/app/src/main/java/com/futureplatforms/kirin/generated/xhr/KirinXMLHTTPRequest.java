package com.futureplatforms.kirin.generated.xhr;
 
 
/**
 * This module is actually replaces the window.XHR with one connected to native. The native implementation should provide resiliance to interrupts.
 */
public interface KirinXMLHTTPRequest {
 
    /**
     * @param newState {@link String}
     */
    void onConnectivityStateChange(String newState);
}
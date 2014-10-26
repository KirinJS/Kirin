package com.futureplatforms.kirin.generated.fs;
 
 
public interface KirinCallback {
 
    /**
     * @param payload {@link Object}
     */
    void callback(Object payload);
 
    /**
     * @param errorCode {@link int}
     * @param errorMessage {@link String}
     */
    void errback(int errorCode, String errorMessage);
}
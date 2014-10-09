package com.futureplatforms.kirin.generated.xhr;
 
import org.json.JSONObject;
import com.futureplatforms.kirin.generated.xhr.KirinXHRProgressEvent;
import com.futureplatforms.kirin.generated.xhr.KirinXHRResponse;
 
/**
 * This is constructed by the new XMLHTTPRequest, to be passed to native. The methods should provide enough for a good experience with the XHR
 */
public interface KirinXHRequest {
 
    String get__id();
 
    String getUrl();
 
    String getMethod();
 
    long getTimeout();
 
    String getResponseType();
 
    JSONObject getRequestHeaders();
 
    /**
     * @param errorMessage {@link String}
     */
    void _doOnInitialisationError(String errorMessage);
 
    /**
     * @param responseHeaders {@link JSONObject}
     * @param event {@link KirinXHRProgressEvent}
     */
    void _doOnConnect(JSONObject responseHeaders, KirinXHRProgressEvent event);
 
    /**
     * @param text {@link String}
     * @param event {@link KirinXHRProgressEvent}
     */
    void _doOnAppendPayload(String text, KirinXHRProgressEvent event);
 
    /**
     * @param statusCode {@link int}
     * @param response {@link KirinXHRResponse}
     * @param event {@link KirinXHRProgressEvent}
     */
    void _doOnRequestComplete(int statusCode, KirinXHRResponse response, KirinXHRProgressEvent event);
 
    /**
     * @param errorMessage {@link String}
     */
    void _doOnInterrupt(String errorMessage);
 
    /**
     * @param eventType {@link String}
     * @param event {@link KirinXHRProgressEvent}
     */
    void _doUploadProgress(String eventType, KirinXHRProgressEvent event);
}
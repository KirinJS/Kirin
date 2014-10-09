package com.futureplatforms.kirin.generated.xhr;
 
import com.futureplatforms.kirin.generated.xhr.KirinXHRequest;
 
/**
 * This module reimplements the bare minimum that native needs to drive an implementation of XMLHTTPRequests, adding resiliance to interrupt events such as loss of network connectivity, application backgrounding and perhaps even reboot.
 */
public interface KirinXHRExtension {
 
    /**
     * @param xhrObject {@link KirinXHRequest}
     * @param data {@link Object}
     */
    void open(KirinXHRequest xhrObject, Object data);
 
    /**
     * @param xhrId {@link String}
     */
    void abort(String xhrId);
}
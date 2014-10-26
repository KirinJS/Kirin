package com.futureplatforms.kirin.generated.fs;
 
import com.futureplatforms.kirin.generated.fs.KirinFile;
import com.futureplatforms.kirin.generated.fs.KirinCallback;
import com.futureplatforms.kirin.generated.fs.KirinOptionalCallback;
 
/**
 * This module reimplements the bare minimum that native needs to drive an implementation of XMLHTTPRequests, adding resiliance to interrupt events such as loss of network connectivity, application backgrounding and perhaps even reboot.
 */
public interface KirinFilesystemExtension {
 
    /**
     * @param file {@link KirinFile}
     * @param javascriptListener {@link KirinCallback}
     */
    void readString(KirinFile file, KirinCallback javascriptListener);
 
    /**
     * @param file {@link KirinFile}
     * @param javascriptListener {@link KirinCallback}
     */
    void readJson(KirinFile file, KirinCallback javascriptListener);
 
    /**
     * @param file {@link KirinFile}
     * @param contents {@link String}
     * @param javascriptListener {@link KirinOptionalCallback}
     */
    void writeString(KirinFile file, String contents, KirinOptionalCallback javascriptListener);
 
    /**
     * @param src {@link KirinFile}
     * @param javascriptListener {@link KirinOptionalCallback}
     */
    void copy(KirinFile src, KirinOptionalCallback javascriptListener);
 
    /**
     * @param fileOrDir {@link KirinFile}
     * @param javascriptListener {@link KirinCallback}
     */
    void list(KirinFile fileOrDir, KirinCallback javascriptListener);
 
    /**
     * @param fileOrDir {@link KirinFile}
     * @param javascriptListener {@link KirinOptionalCallback}
     */
    void remove(KirinFile fileOrDir, KirinOptionalCallback javascriptListener);
}
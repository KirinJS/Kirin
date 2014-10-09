package com.futureplatforms.kirin.generated.fs;
 
 
public interface KirinFile {
 
    String getName();
 
    String getType();
 
    long getSize();
 
    String getFileArea();
 
    /**
     * @param text {@link String}
     */
    void _append(String text);
}
package com.futureplatforms.kirin.internal;

import java.io.File;
import java.text.MessageFormat;

import android.content.Context;
import android.os.Environment;

import com.futureplatforms.kirin.state.IKirinFileSystem;

public class KirinPaths implements IKirinFileSystem {

	private final Context mContext;
	
	private final String mFileAreaPath;
	
	public KirinPaths(Context context) {
		mContext = context;
		
        String packageName = mContext.getPackageName();
        String sdCardPrefix = Environment.getExternalStorageDirectory().getPath();
        mFileAreaPath = MessageFormat.format("{0}/Android/data/{1}/files/", sdCardPrefix, packageName);
	}

    public String getExternalFilePath(String filename) {
        return mFileAreaPath + filename;
    }

    public String getExternalFileUrl(String filename) {
        return "file://" + mFileAreaPath + filename;
    }
    
}

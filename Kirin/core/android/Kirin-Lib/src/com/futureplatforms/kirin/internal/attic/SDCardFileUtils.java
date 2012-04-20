/*
   Copyright 2011 Future Platforms

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/


package com.futureplatforms.kirin.internal.attic;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Set;

import android.content.Context;
import android.net.Uri;
import android.util.Log;

import com.futureplatforms.kirin.C;

public class SDCardFileUtils {

    public File mBaseDir;

    private boolean mBaseDirAvailable = false;

    public SDCardFileUtils(String path) {
        mBaseDir = new File(path);
    }

    public void checkStorageAvailable() throws IOException {
        if (mBaseDirAvailable) {
            return;
        }

        synchronized (mBaseDir) {
            if (!mBaseDir.exists()) {
                mBaseDir.mkdirs();
            } else if (!mBaseDir.isDirectory()) {
                mBaseDir.delete();
                mBaseDir.mkdirs();
            }
    
            if (!mBaseDir.exists() || !mBaseDir.isDirectory() || !mBaseDir.canWrite() || !mBaseDir.canRead()) {
                throw new IOException("Unable to open directory in " + mBaseDir.getAbsolutePath() + " to store files.");
            }
            // we should make the basedir available right before we try and make a file. 
            // (otherwise we have stackoverflow).
            
            mBaseDirAvailable = true;
        }
        try {
            createFile(null, ".nomedia");
        } catch (IOException e) {
            // hum.
        }
    }

    public Uri uriFromFilename(Context context, String filename) throws IOException {
        // passing to an outside intent (crop picture, before wallpaper)
        File file = readableFile(context, filename);
        return Uri.fromFile(file);
    }

    public File readableFile(Context context, String filename) throws IOException {
        checkStorageAvailable();
        return new File(mBaseDir, filename);

        // File file = context.getFileStreamPath(filename);
        // return file;
        // return file;
        // return file;
    }

    private FileOutputStream fileOutputStream(Context context, String filename) throws IOException {
        // return context.openFileOutput(filename,
        // Context.MODE_WORLD_READABLE);

        File file = readableFile(context, filename);
        if (!file.exists()) {
            if (!file.getParentFile().exists()) {
                boolean success = file.getParentFile().mkdirs();
                if (!success) {
                    throw new IOException("Cannot create a new file " + file.getParent());
                }
            }
            boolean success = file.createNewFile();
            if (!success) {
                throw new IOException("Cannot create a new file " + file.getPath());
            }
        }
        return new FileOutputStream(file);
    }

    public InputStream inputStream(Context context, String filename) throws IOException {
        File file = readableFile(context, filename);
        FileInputStream in = new FileInputStream(file);
        return in;
    }

    public void deleteFiles(Context context, Set<String> filenames) {
        int count = 0;
        for (String filename : filenames) {
            count += deleteFile(context, filename);
        }
    }

    public int deleteFile(Context context, String filename) {
        File file = new File(mBaseDir, filename);
        if (file.exists() && file.canWrite()) {
            return file.delete() ? 1 : 0;
        }
        return 0;
    }

    private int recursivelyDelete(File file, Set<String> exceptions) {
        if (file == null) {
            return 0;
        }
        if (file.isFile()) {
            if (exceptions.contains(file.getName())) {
                return 0;
            } else {
                Log.d(C.TAG, "Deleting " + file.getName());
                return file.delete() ? 1 : 0;
            }
        } else if (file.isDirectory()) {
            int count = 0;
            for (File child : file.listFiles()) {
                count += recursivelyDelete(child, exceptions);
            }
            return count;

        } else {
            return 0;
        }
    }

    public int deleteEverything(Context context, Set<String> exceptions) {
        return recursivelyDelete(mBaseDir, exceptions);
    }

    public boolean fileExists(Context context, String filename) {
        try {
            return readableFile(context, filename).exists();
        } catch (IOException e) {
            return false;
        }
    }

    public OutputStream outputStream(Context context, String filename) throws IOException {
        // must be readable for cropping intent, though first used when
        // downloading an image.
        return fileOutputStream(context, filename);
    }

    public Uri createFile(Context context, String filename) throws IOException {
        File wallpaperFile = readableFile(context, filename);
        OutputStream out = null;
        try {
            out = fileOutputStream(context, filename);
            out.write(1);
        } finally {
            IOUtils.close(out);
        }

        return Uri.parse("file:/" + wallpaperFile.getAbsolutePath());

    }
}
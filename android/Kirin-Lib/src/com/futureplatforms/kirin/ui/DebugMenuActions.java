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


package com.futureplatforms.kirin.ui;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.text.MessageFormat;

import com.futureplatforms.kirin.C;
import com.futureplatforms.kirin.internal.IOUtils;

import android.content.Context;
import android.os.Environment;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;

public class DebugMenuActions {

    private final Context mContext;

    public DebugMenuActions(Context context) {
        mContext = context;
    }

    public void onCreateMenu(Menu menu) {
        menu.add(0, C.MENU_DUMP_DB, Menu.CATEGORY_SYSTEM, "Dump DB");
    }

    public boolean onMenuItemSelected(MenuItem item) {
        switch (item.getItemId()) {
        case C.MENU_DUMP_DB:
            dumpDB();
            return true;
        default:
            return false;
        }

    }

    private void dumpDB() {
        try {
            File dataDir = Environment.getDataDirectory();
            File sdCard = Environment.getExternalStorageDirectory();
            
            File dbDir = new File(dataDir, "data/" + mContext.getPackageName() + "/databases/");
            
            File[] files = dbDir.listFiles();
            
            for (File dbFile : files) {
                String databaseName = dbFile.getName();
                File destFile = new File(sdCard, databaseName);
                if (!destFile.exists()) {
                    destFile.createNewFile();
                }
                
                Log.i(C.TAG, MessageFormat.format("Copying {0} to {1}", dbFile.getAbsolutePath(), destFile
                        .getAbsoluteFile())); // use a project specific IOUtils.
                IOUtils.copy(new FileInputStream(dbFile), new FileOutputStream(destFile));
            }
            // takes care of closing both streams.
        } catch (IOException e) {
            Log.e(C.TAG, "Error copying the database", e);
        }

    }
}
